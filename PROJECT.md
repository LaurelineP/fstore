# FSTORE
FStore allows you to manage a hosted file system using AWS.

## Environments
FStore can run in two modes:

- **Regular mode** → connects directly to AWS.

    - Run with: `pnpm dev`
    - Requires: `.env` (production environment file)

- **Local mode** → connects to a cloud emulator (LocalStack).

    - Run with: `pnpm dev:local`
    - Requires: 
        - `dev/.envrc` → sets up the AWS shim to point to LocalStack
        - `.env.local` → local environment file


## Notes
Bun automatically loads `.env` if no `--env-file` is specified.
Variables in the specified `.env` file will be available as usual

Works for both scripts and REPL.

The *regular* mode will use the official `aws`m
while the *local* mode uses the cloud emulator **LocalStack**.


| file | description |
|------|-------------|
| .env | Production environment configuration |
| .envrc |  Shell setup for using the cloud emulator (sourced automatically by `bun dev`) |
| .env.local | Local environment configuration (for LocalStack) |

### Related Scripts - Transparent Execution
While launching the project, this also decide how to launch the project.
`pnpm dev` will run the project to use aws
`pnpm dev:local` will run the project to use the cloud emulator


## [ OPTIONAL ] Use the project with the file emulator
To align with tests and the AWS CLI, the project uses an AWS shim when running in Local mode:

The shim lives in: `<HOME>/dev/aws-shim/aws`

It wraps the real AWS binary and adds arguments like the LocalStack endpoint (http://localhost:4566)

This ensures that any call to aws automatically points to LocalStack.
The inner `<HOME>/aws-shim/aws` will execute the aws binary file with extra arguments such as the endpoint to target: `http://localhost:4566` and a profile if you decide to set one.

### Using the Cloud Emulator (Optional)

- Install LocalStack

- Start LocalStack: `localstack start`
*Default LocalStack URL: http://localhost:4566*

- Instead of AWS S3 URIs, the emulator provides a mounted endpoint.

- The `dev/.envrc` makes sure your aws command is redirected correctly when running locally.
[see](./dev/.envrc)