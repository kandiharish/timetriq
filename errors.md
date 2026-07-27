==> Cloning from https://github.com/kandiharish/timetriq
==> Checking out commit 4ea06177c6e563556bba70b4827b84d2518a25c2 in branch main
==> Using Python version 3.14.3 (default)
==> Docs on specifying a Python version: https://render.com/docs/python-version
==> Installing Python version 3.14.3...
==> Using Poetry version 2.1.3 (default)
==> Docs on specifying a Poetry version: https://render.com/docs/poetry-version
==> Running build command 'pip install -r requirements.txt'...
Collecting fastapi==0.111.0 (from -r requirements.txt (line 1))
  Downloading fastapi-0.111.0-py3-none-any.whl.metadata (25 kB)
Collecting uvicorn==0.30.1 (from -r requirements.txt (line 2))
  Downloading uvicorn-0.30.1-py3-none-any.whl.metadata (6.3 kB)
Collecting pydantic==2.7.4 (from -r requirements.txt (line 3))
  Downloading pydantic-2.7.4-py3-none-any.whl.metadata (109 kB)
Collecting pydantic-core==2.18.4 (from -r requirements.txt (line 4))
  Downloading pydantic_core-2.18.4.tar.gz (385 kB)
  Installing build dependencies: started
  Installing build dependencies: finished with status 'done'
  Getting requirements to build wheel: started
  Getting requirements to build wheel: finished with status 'done'
  Preparing metadata (pyproject.toml): started
  Preparing metadata (pyproject.toml): finished with status 'error'
  error: subprocess-exited-with-error
  
  × Preparing metadata (pyproject.toml) did not run successfully.
  │ exit code: 1
  ╰─> [14 lines of output]
          Updating crates.io index
      warning: failed to write cache, path: /usr/local/cargo/registry/index/index.crates.io-1949cf8c6b5b557f/.cache/ve/rs/version_check, error: Read-only file system (os error 30)
       Downloading crates ...
        Downloaded bitflags v1.3.2
      error: failed to create directory `/usr/local/cargo/registry/cache/index.crates.io-1949cf8c6b5b557f`
      
      Caused by:
        Read-only file system (os error 30)
      💥 maturin failed
        Caused by: Cargo metadata failed. Does your crate compile with `cargo build`?
        Caused by: `cargo metadata` exited with an error:
      Error running maturin: Command '['maturin', 'pep517', 'write-dist-info', '--metadata-directory', '/tmp/pip-modern-metadata-k0d2tiqs', '--interpreter', '/opt/render/project/src/.venv/bin/python3.14']' returned non-zero exit status 1.
      Checking for Rust toolchain....
      Running `maturin pep517 write-dist-info --metadata-directory /tmp/pip-modern-metadata-k0d2tiqs --interpreter /opt/render/project/src/.venv/bin/python3.14`
      [end of output]
  
  note: This error originates from a subprocess, and is likely not a problem with pip.
[notice] A new release of pip is available: 25.3 -> 26.1.2
[notice] To update, run: pip install --upgrade pip
error: metadata-generation-failed
× Encountered error while generating package metadata.
╰─> pydantic-core
note: This is an issue with the package mentioned above, not pip.
hint: See above for details.
==> Build failed 😞
==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys