"""Story textures for shashankmishra.bio. Usage: python scene.py <shot> <out.png> [res] [samples]
shots: paper | kite | cloud1 | cloud2 | cloud3"""
import bpy, sys, math, bmesh, random
shot, out = sys.argv[1], sys.argv[2]
res = int(sys.argv[3]) if len(sys.argv)>3 else 800
spp = int(sys.argv[4]) if len(sys.argv)>4 else 32
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=spp; sc.cycles.use_denoising=True
sc.view_settings.view_transform='AgX'; sc.view_settings.look='AgX - Medium High Contrast'
sc.render.film_transparent = shot!='paper'
sc.render.image_settings.file_format='PNG'; sc.render.image_settings.color_mode='RGBA' if shot!='paper' else 'RGB'
world=bpy.data.worlds.new('w'); sc.world=world; world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(0.97,0.93,0.85,1); world.node_tree.nodes['Background'].inputs[1].default_value=0.35

def cam(loc, rot, ortho=None, lens=50):
    c=bpy.data.cameras.new('c'); o=bpy.data.objects.new('cam',c); sc.collection.objects.link(o); o.location=loc; o.rotation_euler=rot
    if ortho: c.type='ORTHO'; c.ortho_scale=ortho
    else: c.lens=lens
    sc.camera=o
def light(name, kind, loc, rot, energy, size=1, color=(1,0.95,0.88)):
    l=bpy.data.lights.new(name,kind); l.energy=energy; l.color=color
    if kind=='AREA': l.size=size
    if kind=='SUN': l.angle=math.radians(size)
    o=bpy.data.objects.new(name,l); sc.collection.objects.link(o); o.location=loc; o.rotation_euler=rot
def node(nt, t, **kw):
    n=nt.nodes.new(t)
    for k,v in kw.items():
        if k in n.inputs: n.inputs[k].default_value=v
        else: setattr(n,k,v)
    return n

if shot=='paper':
    sc.render.resolution_x=sc.render.resolution_y=res
    bpy.ops.mesh.primitive_plane_add(size=2); p=bpy.context.object
    m=bpy.data.materials.new('paper'); m.use_nodes=True; nt=m.node_tree; bsdf=nt.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value=(0.93,0.89,0.80,1); bsdf.inputs['Roughness'].default_value=0.95
    tc=node(nt,'ShaderNodeTexCoord')
    n1=node(nt,'ShaderNodeTexNoise',Scale=16.0,Detail=8.0,Roughness=0.6)
    v1=node(nt,'ShaderNodeTexVoronoi',Scale=24.0); v1.feature='F1'
    n2=node(nt,'ShaderNodeTexNoise',Scale=4.0,Detail=3.0)
    fib=node(nt,'ShaderNodeTexWave',Scale=3.0,Distortion=22.0,Detail=6.0); fib.wave_type='BANDS'
    mx=node(nt,'ShaderNodeMix'); mx.data_type='FLOAT'; mx.inputs[0].default_value=0.35
    mx2=node(nt,'ShaderNodeMix'); mx2.data_type='FLOAT'; mx2.inputs[0].default_value=0.12
    for n in (n1,v1,n2,fib): nt.links.new(tc.outputs['Object'], n.inputs['Vector'])
    nt.links.new(n1.outputs['Fac'], mx.inputs[2]); nt.links.new(v1.outputs['Distance'], mx.inputs[3])
    nt.links.new(mx.outputs[0], mx2.inputs[2]); nt.links.new(fib.outputs['Fac'], mx2.inputs[3])
    bump=node(nt,'ShaderNodeBump',Strength=0.28,Distance=0.02); nt.links.new(mx2.outputs[0], bump.inputs['Height']); nt.links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    # subtle mottling of tone
    ramp=node(nt,'ShaderNodeValToRGB'); ramp.color_ramp.elements[0].color=(0.90,0.85,0.75,1); ramp.color_ramp.elements[1].color=(0.96,0.93,0.86,1)
    nt.links.new(n2.outputs['Fac'], ramp.inputs[0]); nt.links.new(ramp.outputs[0], bsdf.inputs['Base Color'])
    p.data.materials.append(m)
    cam((0,0,3),(0,0,0),ortho=2.0)
    light('rake','SUN',(0,0,5),(math.radians(72),0,math.radians(-35)),4.0,2)
elif shot=='kite':
    sc.render.resolution_x=res; sc.render.resolution_y=int(res*1.25)
    # diamond sail, slightly bowed, made of a subdivided grid then shaped
    bm=bmesh.new(); W,Hu,Hd=0.62,0.75,1.0
    verts=[(0,Hu,0),(W,0,0),(0,-Hd,0),(-W,0,0)]
    vs=[bm.verts.new(v) for v in verts]; bm.faces.new(vs)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=24, use_grid_fill=True)
    for v in bm.verts:
        x,y,_=v.co; v.co.z = -0.10*(1-(x/W)**2) - 0.015*math.sin(y*9)  # bow + billow
    me=bpy.data.meshes.new('sail'); bm.to_mesh(me); sail=bpy.data.objects.new('sail',me); sc.collection.objects.link(sail)
    for f in me.polygons: f.use_smooth=True
    m=bpy.data.materials.new('kitepaper'); m.use_nodes=True; nt=m.node_tree; b=nt.nodes['Principled BSDF']
    tc=node(nt,'ShaderNodeTexCoord'); n=node(nt,'ShaderNodeTexNoise',Scale=60.0,Detail=10.0,Roughness=0.7)
    nt.links.new(tc.outputs['Object'],n.inputs['Vector'])
    ramp=node(nt,'ShaderNodeValToRGB'); ramp.color_ramp.elements[0].color=(0.42,0.08,0.025,1); ramp.color_ramp.elements[1].color=(0.70,0.20,0.07,1)
    nt.links.new(n.outputs['Fac'],ramp.inputs[0]); nt.links.new(ramp.outputs[0],b.inputs['Base Color'])
    b.inputs['Roughness'].default_value=0.8
    b.inputs['Subsurface Weight'].default_value=0.25; b.inputs['Subsurface Radius'].default_value=(0.6,0.2,0.1)
    if 'Transmission Weight' in b.inputs: b.inputs['Transmission Weight'].default_value=0.15
    bump=node(nt,'ShaderNodeBump',Strength=0.25); nt.links.new(n.outputs['Fac'],bump.inputs['Height']); nt.links.new(bump.outputs['Normal'],b.inputs['Normal'])
    sail.data.materials.append(m)
    # bamboo spars
    bam=bpy.data.materials.new('bamboo'); bam.use_nodes=True; bb=bam.node_tree.nodes['Principled BSDF']; bb.inputs['Base Color'].default_value=(0.55,0.40,0.20,1); bb.inputs['Roughness'].default_value=0.5
    def spar(a,b_,r=0.012):
        import mathutils
        a=mathutils.Vector(a); b_=mathutils.Vector(b_); d=b_-a
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=d.length, location=(a+b_)/2, vertices=12)
        o=bpy.context.object; o.rotation_mode='QUATERNION'; o.rotation_quaternion=d.to_track_quat('Z','Y'); o.data.materials.append(bam)
    spar((0,Hu+0.02,0.012),(0,-Hd-0.02,0.012))
    pts=[(x,0,-0.10*(1-(x/W)**2)+0.012) for x in [i/10*W*2-W for i in range(11)]]
    for i in range(10): spar(pts[i],pts[i+1],0.010)
    # paper edge binding: thin dark border via small cylinders along edges
    edge=bpy.data.materials.new('edge'); edge.use_nodes=True; eb=edge.node_tree.nodes['Principled BSDF']; eb.inputs['Base Color'].default_value=(0.32,0.10,0.04,1)
    cam((0,-0.15,3.4),(0,0,0),lens=50)
    sail.rotation_euler=(math.radians(-10),math.radians(8),0)
    light('key','AREA',(-1.5,-1.2,3),(math.radians(25),math.radians(-30),0),55,2)
    light('back','AREA',(0.5,1.5,-2.5),(math.radians(200),0,0),110,2,(1,0.85,0.6))  # backlight -> translucent glow
    light('fill','AREA',(2,0,2),(0,math.radians(40),0),18,2)
elif shot.startswith('cloud'):
    random.seed({'cloud1':3,'cloud2':11,'cloud3':29}[shot])
    sc.render.resolution_x=res; sc.render.resolution_y=int(res*0.5)
    sc.cycles.volume_bounces=2
    mb=bpy.data.metaballs.new('mb'); mb.resolution=0.08; mb.render_resolution=0.05
    o=bpy.data.objects.new('cloud',mb); sc.collection.objects.link(o)
    n=random.randint(9,13)
    for i in range(n):
        e=mb.elements.new(); x=random.uniform(-1.25,1.25); r=random.uniform(0.45,0.85)*(1-abs(x)/3)
        e.co=(x, random.uniform(-0.2,0.2), random.uniform(0,0.35)*(1-abs(x)/2)+r*0.2); e.radius=r
    for i in range(4):
        e=mb.elements.new(); e.co=(random.uniform(-1.4,1.4),0,-0.15); e.radius=0.6
    m=bpy.data.materials.new('vol'); m.use_nodes=True; nt=m.node_tree
    nt.nodes.remove(nt.nodes['Principled BSDF']); outn=nt.nodes['Material Output']
    pv=node(nt,'ShaderNodeVolumePrincipled'); pv.inputs['Color'].default_value=(1,0.97,0.92,1); pv.inputs['Anisotropy'].default_value=0.35
    tc=node(nt,'ShaderNodeTexCoord'); nz=node(nt,'ShaderNodeTexNoise',Scale=3.2,Detail=12.0,Roughness=0.62)
    nt.links.new(tc.outputs['Object'],nz.inputs['Vector'])
    ramp=node(nt,'ShaderNodeValToRGB'); ramp.color_ramp.elements[0].position=0.42; ramp.color_ramp.elements[0].color=(0,0,0,1); ramp.color_ramp.elements[1].position=0.62; ramp.color_ramp.elements[1].color=(1,1,1,1)
    nt.links.new(nz.outputs['Fac'],ramp.inputs[0])
    mul=node(nt,'ShaderNodeMath',operation='MULTIPLY'); mul.inputs[1].default_value=6.0
    nt.links.new(ramp.outputs[0],mul.inputs[0]); nt.links.new(mul.outputs[0],pv.inputs['Density'])
    nt.links.new(pv.outputs[0],outn.inputs['Volume'])
    o.data.materials.append(m)
    cam((0,-7,0.25),(math.radians(90),0,0),ortho=4.2)
    light('sun','SUN',(0,0,5),(math.radians(35),math.radians(-30),0),11.0,4,(1,0.93,0.82))
    world.node_tree.nodes['Background'].inputs[0].default_value=(0.55,0.68,0.85,1); world.node_tree.nodes['Background'].inputs[1].default_value=1.6
sc.render.filepath=out
bpy.ops.render.render(write_still=True)
print('done',out)
