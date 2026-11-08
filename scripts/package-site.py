from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

project = Path(__file__).resolve().parents[1]
dist = project / 'dist'
outputs = project.parent.parent / 'outputs'
outputs.mkdir(exist_ok=True)
archive = outputs / '사주정원-사이트.zip'
with ZipFile(archive, 'w', compression=ZIP_DEFLATED) as bundle:
    for item in sorted(dist.rglob('*')):
        if item.is_file():
            bundle.write(item, (Path('사주정원') / item.relative_to(dist)).as_posix())
    bundle.write(project / 'README.md', '사주정원-읽어보기.md')
with ZipFile(archive) as bundle:
    assert bundle.testzip() is None
print(archive.name, archive.stat().st_size)
