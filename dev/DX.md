# Development Experience
This folders is a collection of tools in order to enhance the development experience for the "local" launch mode.
The Local mode relies on the LocalStack use ( a mounted cloud emulator host for AWS ).

It sets:
- `aws` to use `aws-shim` ( prealably configured - TODO: could be done in a script ) 
- the current state of the application by restoring action done during the development.


# Trace history ~ commands related
## Init
- run `sampleexamples.sh` to load samples to play with
- (?) Creating DB / Tables ?
- Start project ( with cloud emulator ) `bun dev:local`