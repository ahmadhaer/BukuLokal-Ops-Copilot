"""Scan repository text/client chunks without reading environment credential files."""
from pathlib import Path
import json
import re
import subprocess
ROOT = Path(__file__).resolve().parents[3]
files = [ROOT / p for p in subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard'], cwd=ROOT, text=True).splitlines() if (ROOT / p).is_file() and Path(p).suffix not in {'.png', '.xlsx'}]
patterns = [r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----', r'AIza[0-9A-Za-z_-]{35}', r'"type"\s*:\s*"service_account"', r'gh[pousr]_[A-Za-z0-9]{30,}', r'ya29\.[A-Za-z0-9_-]{20,}', r'"(?:private_key|client_secret|access_token)"\s*:\s*"[^"\s]{8,}']
hits = [{'file': str(p.relative_to(ROOT)), 'pattern': pattern} for p in files for pattern in patterns if re.search(pattern, p.read_text(errors='replace'))]
chunks = list((ROOT / '.next/static').rglob('*.js'))
markers = ['@google/genai', 'TestProvider', 'buildTestApplication', '/__test/application', 'synthetic-test-model', '@google-cloud/firestore', '@google-cloud/firestore-api', 'google-auth-library', 'GOOGLE_CLOUD_PROJECT', 'GOOGLE_APPLICATION_CREDENTIALS', 'GOOGLE_CLOUD_LOCATION', 'GEMINI_MODEL', 'FIRESTORE_EMULATOR_HOST', 'application_default_credentials.json', 'private_key', 'client_email', 'service_account']
bundle_hits = [{'file': str(p.relative_to(ROOT)), 'marker': marker} for p in chunks for marker in markers if marker in p.read_text(errors='replace')]
protected = subprocess.check_output(['git', 'diff', '--name-only', '6b1c399c6a73c2179200ae6a909d99858cfd2b0e', '--', 'src/domain', 'src/ai', 'src/features/imports', 'src/features/actions', 'docs/adr', 'LICENSE', 'tests/unit/ai', 'tests/unit/imports', 'tests/unit/operations', 'tests/unit/issues', 'tests/unit/product', 'tests/unit/home.test.tsx'], cwd=ROOT, text=True)
old = json.loads(subprocess.check_output(['git', 'show', '6b1c399c6a73c2179200ae6a909d99858cfd2b0e:package-lock.json'], cwd=ROOT, text=True))
new = json.loads((ROOT / 'package-lock.json').read_text())
changed = [name for name, package in old['packages'].items() if name and name in new['packages'] and package.get('version') != new['packages'][name].get('version')]
server_files = [p for p in (ROOT / 'src/application').glob('*.ts') if p.name != 'contracts.ts'] + list((ROOT / 'src/lib/firestore').glob('*.ts')) + list((ROOT / 'src/repositories').rglob('*.ts')) + [p for p in (ROOT / 'src/features/persistence').glob('*.ts') if p.name != 'contracts.ts']
missing = [str(p.relative_to(ROOT)) for p in server_files if 'import "server-only";' not in p.read_text()]
memory_imports = [str(p.relative_to(ROOT)) for p in (ROOT / 'src').rglob('*.ts*') if '/memory/' not in str(p) and re.search(r'import.*[\"\'][^\"\']*memory/', p.read_text())]
report = {'source_files_scanned': len(files), 'source_secret_hits': hits, 'client_chunks_scanned': len(chunks), 'client_server_sdk_config_hits': bundle_hits, 'server_only_modules_checked': len(server_files), 'missing_server_only_marker': missing, 'production_memory_imports': memory_imports, 'protected_source_diff': protected, 'existing_lock_versions_changed': changed, 'firestore_sdk': new['packages']['']['dependencies']['@google-cloud/firestore'], 'firestore_emulator_test': 'NOT_RUN_UNAVAILABLE', 'live_golden_path_smoke_test': 'NOT_RUN_MISSING_CLOUD_CONFIG', 'network_database_calls': 'none', 'remote_mutations': 'none'}
(ROOT / 'docs/evidence/WU-08/security-scope-checks.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
assert chunks, 'Build before running this scan.'
assert not hits and not bundle_hits and not missing and not memory_imports and not protected and not changed
