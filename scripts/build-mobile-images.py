"""Build mobile-only WebP variants without changing desktop originals."""
from pathlib import Path
from PIL import Image, ImageOps
import json,re
root=Path(__file__).resolve().parents[1];dist=root/'dist'
projects=json.loads((dist/'assets/projects.json').read_text());home=(dist/'index.html').read_text()
sources={p['image'] for p in projects}
sources.update(re.findall(r'<img\b[^>]*\bsrc="(assets/(?:category-covers|keywords)/[^" ]+|assets/studio-[^" ]+)"',home))
mapping={};before=after=0
for source in sorted(sources):
 im=ImageOps.exif_transpose(Image.open(dist/source));im.thumbnail((640,4096),Image.Resampling.LANCZOS)
 im=im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
 relative=Path('assets/mobile')/Path(source).relative_to('assets').with_suffix('.webp');dest=dist/relative;dest.parent.mkdir(parents=True,exist_ok=True)
 im.save(dest,'WEBP',quality=68,method=6)
 mapping[source]=relative.as_posix();before+=(dist/source).stat().st_size;after+=dest.stat().st_size
for p in projects:p['mobileImage']=mapping[p['image']]
(dist/'assets/projects.json').write_text(json.dumps(projects,ensure_ascii=False,indent=2)+'\n')
# Wrap static images in responsive pictures. Sources select mobile files even on high-DPR phones.
def wrap(match):
 tag=match[0];src=re.search(r'\bsrc="([^"]+)"',tag)[1]
 mobile=mapping.get(src)
 if src=='assets/zhang-tianyu.webp':mobile='assets/zhang-tianyu-mobile.webp'
 if not mobile:return tag
 return '<picture class="mobile-responsive"><source media="(max-width: 899px)" srcset="'+mobile+'"/>'+tag+'</picture>'
home=re.sub(r'<picture class="mobile-responsive"><source[^>]*>(<img\b[^>]*>)</picture>',r'\1',home)
home=re.sub(r'<img\b[^>]*>',wrap,home)
css='''<style data-8b-part="mobile-images">
picture.mobile-responsive { display: block; width: 100%; height: 100%; }
#work .category-preview > picture { min-width: 0; min-height: 0; }
#work .category-preview picture img { display: block; width: 100%; height: 100%; object-fit: cover; }
</style>\n'''
home=re.sub(r'<style data-8b-part="mobile-images">[\s\S]*?</style>\s*','',home)
home=home.replace('</head>',css+'</head>')
for key in ['brand','local','render']:home=home.replace('category-preview--'+key+' > img','category-preview--'+key+' img')
(dist/'index.html').write_text(home)
(dist/'assets/mobile/manifest.json').write_text(json.dumps({'maxWidth':640,'quality':68,'originalBytes':before,'mobileBytes':after,'images':mapping},ensure_ascii=False,indent=2)+'\n')
print(f'{len(mapping)} mobile variants: {before} -> {after} bytes ({(1-after/before)*100:.1f}% smaller). Desktop originals unchanged.')
