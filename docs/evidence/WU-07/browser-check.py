"""Optional local production check using the environment's existing Chromium/CDP."""
import asyncio, base64, json, pathlib, urllib.request
import websockets
ROOT = pathlib.Path(__file__).resolve().parents[3]
BASE = 'http://127.0.0.1:3001'
async def main():
    targets = json.load(urllib.request.urlopen('http://127.0.0.1:9222/json'))
    async with websockets.connect(targets[0]['webSocketDebuggerUrl'], origin='http://localhost:9222') as ws:
        serial = 0
        async def call(method, params=None):
            nonlocal serial
            serial += 1
            await ws.send(json.dumps({'id': serial, 'method': method, 'params': params or {}}))
            while True:
                response = json.loads(await ws.recv())
                if response.get('id') == serial:
                    return response.get('result', response)
        async def evaluate(script):
            return (await call('Runtime.evaluate', {'expression': script, 'returnByValue': True}))['result'].get('value')
        await call('Page.enable')
        await call('Emulation.setDeviceMetricsOverride', {'width': 1280, 'height': 1100, 'deviceScaleFactor': 1, 'mobile': False})
        await call('Page.navigate', {'url': BASE + '/demo'})
        for _ in range(60):
            await asyncio.sleep(.1)
            if await evaluate("document.body.innerText.includes('Workspace storage is not configured')"):
                break
        dashboard = await evaluate('document.body.innerText')
        assert 'Workspace storage is not configured' in dashboard
        assert 'changes are not saved' in dashboard
        assert 'Operations overview' in dashboard
        await evaluate("Array.from(document.querySelectorAll('article')).find(x=>x.innerText.includes('SO-001 may miss its deadline')).querySelector('a').click()")
        for _ in range(60):
            await asyncio.sleep(.1)
            if await evaluate("document.querySelector('h1')?.innerText==='SO-001 may miss its deadline'"):
                break
        detail = await evaluate('document.body.innerText')
        assert all(value in detail for value in ['30%', '200 pcs', '2 days', 'not configured'])
        assert await evaluate("Array.from(document.querySelectorAll('button')).find(x=>x.innerText==='Analyze with AI').disabled")
        size = await evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})')
        assert size['scroll'] <= size['width']
        screenshot = await call('Page.captureScreenshot', {'format': 'png', 'captureBeyondViewport': True})
        (ROOT / 'docs/evidence/WU-07/unconfigured-storage-desktop.png').write_bytes(base64.b64decode(screenshot['data']))
        await call('Page.reload')
        await asyncio.sleep(1)
        assert await evaluate("document.body.innerText.includes('Workspace storage is not configured')")
        http = []
        for route in ['/', '/data', '/demo', '/issues', '/actions', '/activity', '/import']:
            response = urllib.request.urlopen(BASE + route)
            http.append({'route': route, 'status': response.status})
        report = {'configured': False, 'dashboard': dashboard, 'detail': detail, 'viewport': size, 'refresh_preserves_truthful_storage_error': True, 'http': http, 'live_database_test': 'NOT_RUN_NO_CONFIG'}
        (ROOT / 'docs/evidence/WU-07/browser-checks.json').write_text(json.dumps(report, indent=2))
        print(json.dumps({'storage_error_visible': True, 'read_only_evidence_visible': True, 'refresh_error_visible': True, 'http': http}, indent=2))
asyncio.run(main())
