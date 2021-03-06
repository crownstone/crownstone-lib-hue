export const ERROR_CODES = {
    401: "Unauthorized user on Bridge.",
    404: "Bridge is unreachable and probably offline.",
    405: "Bridge is not authenticated for this action.",
    406: "Link button on Bridge is not pressed.",
    407: "Bridge is not initialized.",
    408: "Bridge has no Bridge Id and thus cannot be rediscovered.",
    410: "The given bridge already exists.",
    411: "The given bridge ip address already exists.",
    412: "Something went wrong when trying to configure a light.",
    413: "Bridge can not be created, neither a ip address nor a bridge id is given.",
    422: "Light is not found on the bridge.",
    423: "Cannot manipulate light when light is off.",
    424: "Something went wrong with an action call to the Philips Hue Bridge, see description for more information.",
    425: "Given light type is not supported.",
    426: "Extra parameters are missing or not supported, please check your parameters with the given ApiCall.",
    427: "Given device name is too long, make sure it is between 0 and 19 characters.",
    428: "Given app name is too long, make sure it is between 0 and 20 characters.",
    888: "Unknown action call to Hue Api.",
    999: "Unknown Error, see description."
}


export class CrownstoneHueError extends Error {
    errorCode: number;
    description: string;

    constructor(errorCode, description?) {
        if (description == undefined) {
            description = "";
        }
        super(ERROR_CODES[errorCode]);
        this.errorCode = errorCode;
        this.name = "CrownstoneHueError";
        this.description = description
    }

}