Using cached pycparser-3.0-py3-none-any.whl (48 kB)
Using cached mdurl-0.1.2-py3-none-any.whl (10.0 kB)
Installing collected packages: websockets, uvloop, urllib3, uritemplate, ujson, typing-extensions, shellingham, pyyaml, python-multipart, python-dotenv, pyparsing, pyjwt, pygments, pycparser, pyasn1, protobuf, orjson, msgpack, mdurl, MarkupSafe, idna, httptools, h11, google-crc32c, dnspython, click, charset_normalizer, certifi, annotated-types, annotated-doc, uvicorn, requests, pydantic-core, pyasn1-modules, proto-plus, markdown-it-py, jinja2, httplib2, httpcore, grpcio, googleapis-common-protos, google-resumable-media, email_validator, cffi, anyio, watchfiles, starlette, rich, pydantic, httpx, grpcio-status, cryptography, cachecontrol, typer, rich-toolkit, pydantic-settings, google-auth, google-auth-httplib2, google-api-core, fastapi-cli, google-cloud-core, google-api-python-client, fastapi, google-cloud-storage, google-cloud-firestore, firebase-admin
Successfully installed MarkupSafe-3.0.3 annotated-doc-0.0.5 annotated-types-0.8.0 anyio-4.14.2 cachecontrol-0.14.4 certifi-2026.7.22 cffi-2.1.0 charset_normalizer-3.4.9 click-8.4.2 cryptography-49.0.0 dnspython-2.8.0 email_validator-2.3.0 fastapi-0.111.0 fastapi-cli-0.0.32 firebase-admin-6.5.0 google-api-core-2.33.0 google-api-python-client-2.198.0 google-auth-2.56.2 google-auth-httplib2-0.4.0 google-cloud-core-2.6.0 google-cloud-firestore-2.28.0 google-cloud-storage-3.13.0 google-crc32c-1.8.0 google-resumable-media-2.10.0 googleapis-common-protos-1.75.0 grpcio-1.83.0 grpcio-status-1.83.0 h11-0.16.0 httpcore-1.0.9 httplib2-0.32.0 httptools-0.8.0 httpx-0.28.1 idna-3.18 jinja2-3.1.6 markdown-it-py-4.2.0 mdurl-0.1.2 msgpack-1.2.1 orjson-3.11.9 proto-plus-1.28.2 protobuf-7.35.1 pyasn1-0.6.4 pyasn1-modules-0.4.2 pycparser-3.0 pydantic-2.7.4 pydantic-core-2.18.4 pydantic-settings-2.3.4 pygments-2.20.0 pyjwt-2.13.0 pyparsing-3.3.2 python-dotenv-1.0.1 python-multipart-0.0.32 pyyaml-6.0.3 requests-2.34.2 rich-15.0.0 rich-toolkit-0.20.3 shellingham-1.5.4 starlette-0.37.2 typer-0.27.0 typing-extensions-4.16.0 ujson-5.13.0 uritemplate-4.2.0 urllib3-2.7.0 uvicorn-0.30.1 uvloop-0.22.1 watchfiles-1.2.0 websockets-17.0
[notice] A new release of pip is available: 24.0 -> 26.1.2
[notice] To update, run: pip install --upgrade pip
==> Uploading build...
==> Uploaded in 3.7s. Compression took 1.1s
==> Build successful 🎉
==> Deploying...
==> Setting WEB_CONCURRENCY=1 by default, based on available CPUs in the instance
==> Running 'uvicorn app.main:app --host 0.0.0.0 --port 10000'
INFO:     Started server process [60]
INFO:     Waiting for application startup.
ERROR:    Traceback (most recent call last):
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/starlette/routing.py", line 732, in lifespan
    async with self.lifespan_context(app) as maybe_state:
  File "/opt/render/project/python/Python-3.11.9/lib/python3.11/contextlib.py", line 210, in __aenter__
    return await anext(self.gen)
           ^^^^^^^^^^^^^^^^^^^^^
  File "/opt/render/project/src/backend/app/main.py", line 12, in lifespan
    init_firebase()
  File "/opt/render/project/src/backend/app/core/firebase.py", line 29, in init_firebase
    db = firestore.client()
         ^^^^^^^^^^^^^^^^^^
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/firebase_admin/firestore.py", line 53, in client
    fs_client = _utils.get_app_service(app, _FIRESTORE_ATTRIBUTE, _FirestoreClient.from_app)
                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/firebase_admin/_utils.py", line 98, in get_app_service
    return app._get_service(name, initializer) # pylint: disable=protected-access
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/firebase_admin/__init__.py", line 297, in _get_service
    self._services[name] = initializer(self)
                           ^^^^^^^^^^^^^^^^^
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/firebase_admin/firestore.py", line 69, in from_app
    credentials = app.credential.get_credential()
                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/firebase_admin/credentials.py", line 142, in get_credential
    self._load_credential()
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/firebase_admin/credentials.py", line 159, in _load_credential
    self._g_credential, self._project_id = google.auth.default(scopes=_scopes)
                                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/google/auth/_default.py", line 748, in default
    raise exceptions.DefaultCredentialsError(_CLOUD_SDK_MISSING_CREDENTIALS)
google.auth.exceptions.DefaultCredentialsError: Your default credentials were not found. To set up Application Default Credentials, see https://cloud.google.com/docs/authentication/external/set-up-adc for more information.
ERROR:    Application startup failed. Exiting.
==> Exited with status 3
==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys
==> Running 'uvicorn app.main:app --host 0.0.0.0 --port 10000'
INFO:     Started server process [42]
INFO:     Waiting for application startup.
==> No open ports detected, continuing to scan...
==> Docs on specifying a port: https://render.com/docs/web-services#port-binding
Need better ways to work with logs? Try theRender CLI, Render MCP Server, or set up a log strea