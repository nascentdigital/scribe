// imports
import {NotImplementedError, RuntimeError} from "@nascentdigital/errors";
import {isBrowser, isNode} from "browser-or-node"
import Chalk from'chalk'
import {LogContext, LogMethod, LogParameter, LogNamespace} from "../Log";
import {Scribe} from '../Scribe';


/**
 * Thoughts by Sim:
 *
 * Interface for the Transform:
 *   1. Options should provide some utility - you get something for setting them.  "none" as an option seems to have no
 *      utility, since you might as well just not use the transform.
 *   2. These options lack control - Why can't I set the colours, at least for "level" logging?
 *
 * Encapsulating via Modules:
 *   1. You're violating the concept of "modules" - modules encapsulate functionality, not a namespace per-se, but they
 *      are larger than Classes (Java uses "packages", .NET uses "assemblies", NodeJS uses "modules""
 *      - DLL/package/module(.js) -> Functions + Constants + Classes + etc.
 *      - Allows you to group common things, load them as a whole unit, hide shared / internal variables + functions
 *   2. All code + types + state specific to a **module** should be contained by the module
 *   3. Violations:
 *      - `LogColoringOption`, `LogColorRGB` in the "core" Log.ts
 *      - `Scribe.logColors` map in the global `Scribe` instance
 *
 * Naming:
 *    1. Names seem really long, but clear + specific.  You're 80% there - but the elegance comes to the distilling of
 *       the name.  If you can shorten the name to something less than 12 characters - you're going to learn a lot about
 *       the function + your design.  The name is usually too long because:
 *       a) The you're still too generic on or unclear of what it does
 *       b) You're trying to do too much with it
 *       c) You haven't contained it in something more specific (i.e. you have a global function that acutally should
 *          have prefixes of the name implied by the thing it belongs to - module, class, etc)
 *
 *
 * TODO:
 *    1. Fix this `LogColorRGB` type
 *    2. Decouple browser vs non-browser handling... maybe later even pulling it out into a separate method
 *     - What's the best way / most reliable way to tell if you're in Node vs Browser (e.g. if (window), etc.)
 *    3. Add some argument validation and custom exceptions (e.g. ArgumentOutOfRangeError if color is out of range)
 *    3. Maybe change the `ColorTransform` function to be a factory class?
 */

// error classes
class ArgumentOutOfRangeError extends RuntimeError {}
class UnsupportedEnvError extends RuntimeError {}
class UnsupportedFormatError extends RuntimeError {}

// log color types
export type LogColorRGB = {
    red: number;
    green: number;
    blue: number;
}
export type LogColorHSL = {
    hue: number;
    saturation: number;
    lightness: number;
}
export type LogColor = LogColorRGB | LogColorHSL;

// color transformation supported environments
enum SupportedEnvironments {
    'DESKTOP',
    'BROWSER'
}

// utility functions
function isRGB(color: LogColor) : color is LogColorRGB {
    return Object.prototype.hasOwnProperty.call(color, "red")
}

function isHSL(color: LogColor) : color is LogColorHSL {
    return Object.prototype.hasOwnProperty.call(color, "hue")
}

function getEnvironment() {
    if (isNode) {
        return SupportedEnvironments.DESKTOP
    }
    else if (isBrowser) {
        return SupportedEnvironments.BROWSER
    }
    else {
        return undefined
    }
}

class ColorValidator {
    constructor(
        private _color: LogColor
    ) {}

    _validateRGB(rgb: LogColorRGB) {
        // red should be between 0 ~ 255
        if (rgb.red < 0 || rgb.red > 255) throw new ArgumentOutOfRangeError('value of red should be between 0 to 255')
        // green should be between 0 ~ 255
        if (rgb.green < 0 || rgb.green > 255) throw new ArgumentOutOfRangeError('value of green should be between 0 to 255')
        // blue
        if (rgb.blue < 0 || rgb.blue > 255) throw new ArgumentOutOfRangeError('value of blue should be between 0 to 255')
    }

    _validateHSL(hsl: LogColorHSL) {
        // hue should be between 0 ~ 360
        if (hsl.hue < 0 || hsl.hue > 360) throw new ArgumentOutOfRangeError('value of hue should be between 0 to 360')
        // saturation should be between 0 ~ 1
        if (hsl.saturation < 0 || hsl.saturation > 1) throw new ArgumentOutOfRangeError('value of saturation should be between 0 to 1')
        // lightness should be between 0 ~ 360
        if (hsl.lightness < 0 || hsl.lightness > 1) throw new ArgumentOutOfRangeError('value of lightness should be between 0 to 1')
    }

    /**
     * method that validates if the given LogColor is valid
     * @throws {ArgumentOutOfRangeError} if any of the color values are out of range
     * @throws {}
     */
    validate() {
        if (isRGB(this._color)) {
            this._validateRGB(this._color)
        }
        else if (isHSL(this._color)) {
            this._validateHSL(this._color)
        }
        else {
            throw new UnsupportedFormatError('The color format should be either RGB or HSL.')
        }
    }
}

export abstract class ColoringStrategy {
    abstract getColor(context: LogContext): LogColor;
}

/**
 * This strategy can be used to apply color based on the log's namespace.
 * a random color is generated for each namespace
 */
export class NamespaceColoringStrategy extends ColoringStrategy {

    private readonly _namespaceColors: Map<LogNamespace, LogColorRGB> = new Map<LogNamespace, LogColorRGB>() 

    public getColor(context: LogContext): LogColor {

        // get namespace from the context
        const namespace = context.log.namespace

        // find the log color for this namespace
        if (this._namespaceColors.has(namespace)) {
            
            // return the existing color
            return this._namespaceColors.get(namespace) as LogColor
        }

        // create a new color for this namespace since it doesn't already exist
        const logColor: LogColorRGB = {
            red: 255 * Math.random(),
            green: 255 * Math.random(),
            blue: 255 * Math.random(),
        }

        // set the new color as the color for this namespace
        this._namespaceColors.set(namespace, logColor)

        // return the new color
        return logColor 
    }
}

/**
 * This strategy can be used to apply color based on the log level
 */
export class LevelColoringStrategy extends ColoringStrategy {
    /**
     * @param _levelColors a mapping from log method to its RGB color
     */
    constructor(private _levelColors: Record<LogMethod, LogColor>) {
        super();
    }

    public getColor(context: LogContext): LogColor {
        return this._levelColors[context.method]
    }
}

export class ColorTransformFactory {
    /**
     * @param strategy strategy for coloring the log message
     */
    static create(strategy: ColoringStrategy) {
        return function (context: LogContext) {
                
            // get color
            const color = strategy.getColor(context)
    
            // validate color
            const colorValidator = new ColorValidator(color)
            colorValidator.validate()
    
            // TODO: abstract the transforming from color -> message
            // apply color to message
            let message = context.message;
    
            // get the current environment
            const env = getEnvironment()
            
            // check if the code is running on desktop
            if (env === SupportedEnvironments.DESKTOP) {
                // convert the color to a Chalk
                const chalk = isRGB(color)
                    ? Chalk.rgb(color.red, color.green, color.blue)
                    : Chalk.hsl(color.hue, color.saturation*100.0, color.lightness*100.0)
    
                // convert message
                message = chalk(message)
            }
    
            // apply for browser
            else if (env == SupportedEnvironments.BROWSER) {
                throw new NotImplementedError('Browser support comming soon!')
            }
    
            // any other environments are unsupported
            else {
                throw new UnsupportedEnvError('Color transform only supports browser and node environment');
            }
    
            // return transfomed context
            return Object.assign({}, context, {message});
        }
    }
}

function test() {
    const globalLog = Scribe.log

    Scribe.transform = ColorTransformFactory.create(new LevelColoringStrategy({
        'trace': {
            'red': 0,
            'green': 0,
            'blue': 0
        } as LogColorRGB,
        'debug': {
            'hue': 30,
            'saturation': 0.8,
            'lightness': 0.5
        } as LogColorHSL,
        'info': {
            'red': 100,
            'green': 23,
            'blue': 160
        } as LogColorRGB,
        'warn': {
            'red': 230,
            'green': 22,
            'blue': 190
        } as LogColorRGB,
        'error': {
            'red': 0,
            'green': 50,
            'blue': 200
        } as LogColorRGB,
    }))
    
    globalLog.trace('trace log')
    globalLog.debug('debug log')
    globalLog.info('info log')
    globalLog.warn('warn log')
    globalLog.error('error log')
    
    const logForModuleA = Scribe.getLog("moduleA")
    const logForModuleAMethodFoo = Scribe.getLog("moduleA:foo")
    const logForModuleB = Scribe.getLog("moduleB")
    const logForModuleC = Scribe.getLog("moduleC")
    const logForModuleD = Scribe.getLog("moduleD")
    const logForModuleE = Scribe.getLog("moduleE")
    const logForModuleF = Scribe.getLog("moduleF")
    const logForModuleG = Scribe.getLog("moduleG")
    const logForModuleH = Scribe.getLog("moduleH")
    
    Scribe.transform = ColorTransformFactory.create(new NamespaceColoringStrategy())
    
    logForModuleA.debug("debug message from moduleA")
    logForModuleA.debug("debug message from moduleA")
    logForModuleAMethodFoo.debug("debug message from moduleA:foo")
    logForModuleAMethodFoo.debug("debug message from moduleA:foo")
    logForModuleB.debug("debug message from moduleB")
    logForModuleB.debug("debug message from moduleB")
    logForModuleC.debug("debug message from moduleC")
    logForModuleD.debug("debug message from moduleD")
    logForModuleE.debug("debug message from moduleE")
    logForModuleF.debug("debug message from moduleF")
    logForModuleG.debug("debug message from moduleG")
    logForModuleH.debug("debug message from moduleH")
    
}

