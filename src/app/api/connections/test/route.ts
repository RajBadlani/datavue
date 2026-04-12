import { ConnectionCredentials, createDriver } from "@/db/drivers";
import { DBType } from "@/generated/prisma/enums";
import { ApiError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-handler";
import { requireAuthSession } from "@/lib/server/resolve-user";
import { NextRequest, NextResponse } from "next/server";

interface TestConnectionBody{
    dbType : DBType
    host : string
    port : number
    user : string
    password : string
    database : string
    ssl : boolean
}

export const POST = withErrorHandler ( async ( req : NextRequest)=>{

    await requireAuthSession()

    const body = await req.json() as TestConnectionBody
    const { dbType , host , port , user , password , database , ssl } = body

    if( !dbType || !host || !port || !user || !password || !database ){
        throw new ApiError("INVALID_INPUT" , 'Missing required fields: dbType, host, port, user, password, database', 400)
    }

    if( !Object.values(DBType).includes(dbType)){
        throw new ApiError("INVALID_DB_TYPE" , `Unsupported database type : ${dbType}` , 400)
    }

    const credentials : ConnectionCredentials = {
        host , port : Number(port) , user , password , database , ssl : Boolean(ssl)
    }

    const driver = createDriver(dbType , credentials)

    let result : { success : boolean , latencyMs : number }

    try {
        result = await driver.testConnection()
    } catch (error) {
        console.error("Test connection failed" , error)
        const message = error instanceof Error ? error.message : "Unknown error"
        throw new ApiError("CONNECTION_FAILED" , message , 500)
    } finally {
        await driver.disconnect()
    }

    return NextResponse.json({
    success: result.success,
    latencyMs: result.latencyMs,
    message: `Connected successfully in ${result.latencyMs}ms`,
  })
})
