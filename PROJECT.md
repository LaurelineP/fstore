# FSTORE
FStore allows you to manage a hosted file system using AWS.

## Environments
This FStore can run in two modes:

- **Regular mode** → connects directly to AWS.

    - Run with: `bun dev`
    - Requires: `.env` (production environment file)

- **Local mode** → connects to a cloud emulator (LocalStack).

    - Run with: `bun dev:local`
    - Requires: 
        - `./dev/.envrc` → sets up the AWS shim to point to LocalStack
        - `.env.local` → local environment file using the shimmed `aws-shim` executable
        - `.env` → regular environment file -> using the original `aws` command

### Requirements: 
- Project files requirements - to provide
    - [ ] `.env.local` file
    - [ ] `.env` file
- Local Machine requirements
    - [ ] your aws shim executable file - to create (here) at `$HOME/dev/aws-shim/aws`
    ```sh
    #!/bin/bash


    # Without aws profile
    exec /opt/homebrew/bin/aws --endpoint-url localhost:4566 "$@"

    # With a profile configuring the `endpoint-url` argument
    exec /opt/homebrew/bin/aws --profile localstack-boot "$@"

    ```
- Lauching command recommendation: use project scripts command rather that executing `bun src/index` in the terminal
    - `bun dev` - will use the original `aws` command
    - `bun dev:local` - will use the `aws` binary execution through the `aws-shim` -> to run on the cloud emulator


## Notes
Bun automatically loads `.env` if no `--env-file` is specified.
Variables in the specified `.env` file will be available as `regular`.

Works for both scripts and REPL.

The *regular* mode will use the official `aws`m
while the *local* mode uses the cloud emulator **LocalStack**.


| file | description |
|------|-------------|
| `.env` | Production environment configuration |
| `./dev/.envrc` |  Shell setup to use or not the cloud emulator (sourced automatically by `bun dev` command) |
| `.env.local` | Local environment configuration (for LocalStack) |

Environment variables file: Sets values as needed
- Pay attention to the "endpoints" bound to aws services,
they might need to change.

### Related Scripts - Transparent Execution
While launching the project, this also decides how to launch the project.
`bun dev` will run the project to use aws
`bun dev:local` will run the project to use the cloud emulator


## [ OPTIONAL ] Use the project with the cloud emulator
To align with tests using `aws` original command and the use of the cloud emulator, the project uses an AWS shim when running in Local mode:

The shim lives in: `<HOME>/dev/aws-shim/aws`  
_This could live anywhere as long as this can be executed_ 

It wraps the real AWS binary and adds arguments like the LocalStack endpoint (http://localhost:4566) and/or aws profile created if you use one.

This ensures that any call to `aws` automatically points to LocalStack.
The inner `<HOME>/dev/aws-shim/aws` will execute the aws binary file with extra arguments such as the endpoint to target: `http://localhost:4566` and a profile if you decide to set one.

### Using the Cloud Emulator (Optional)

- Install LocalStack ( CLI and Desktop )

- Start LocalStack: `localstack start`
*Default LocalStack URL: http://localhost:4566*

- Instead of AWS S3 URIs, the emulator provides a mounted endpoint URL to refer to when requesting for instance the S3 Bucket.

- The `dev/.envrc local` makes sure your aws command is redirected correctly when running locally.
[see](./dev/.envrc)