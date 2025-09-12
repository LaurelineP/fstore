export const spawnPipedFileProcess = async (commandArgs: string[], label: string = 'File' ) => {
    
    label = (label || commandArgs[0]).toUpperCase()

    const fileProcess = Bun.spawn({
        cmd: commandArgs,
        stdout: 'pipe',
        stderr: 'pipe'
    })

    const hasFailed = (await fileProcess.exited) !== 0
    if( hasFailed ){
        const error = await new Response(fileProcess.stdout).text()
        throw new Error(`[ ${label} ] Failed to create process.`)
    }

    return fileProcess

}