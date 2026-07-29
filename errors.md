 File "/opt/render/project/src/.venv/lib/python3.11/site-packages/firebase_admin/credentials.py", line 142, in get_credential
    self._load_credential()
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/firebase_admin/credentials.py", line 159, in _load_credential
    self._g_credential, self._project_id = google.auth.default(scopes=_scopes)
                                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/google/auth/_default.py", line 748, in default
    raise exceptions.DefaultCredentialsError(_CLOUD_SDK_MISSING_CREDENTIALS)
google.auth.exceptions.DefaultCredentialsError: Your default credentials were not found. To set up Application Default Credentials, see https://cloud.google.com/docs/authentication/external/set-up-adc for more information.
ERROR:    Application startup failed. Exiting.
==> Running 'uvicorn app.main:app --host 0.0.0.0 --port 10000'
INFO:     Started server process [43]
INFO:     Waiting for application startup.
==> No open ports detected, continuing to scan...
==> Docs on specifying a port: https://render.com/docs/web-services#port-binding
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