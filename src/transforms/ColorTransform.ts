// imports
import {NotImplementedError, RuntimeError} from "@nascentdigital/errors";
import Chalk from 'chalk'
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


class ArgumentOutOfRangeError extends RuntimeError {}


// types
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

function isRGB(color: LogColor) : color is LogColorRGB {
    return Object.prototype.hasOwnProperty.call(color, "red")
}


export abstract class ColoringStrategy {
    abstract getColor(context: LogContext): LogColor;
}

export class NamespaceColoringStrategy extends ColoringStrategy {

    private readonly _namespaceColors = new Map<LogNamespace, LogColorRGB>()

    public getColor(context: LogContext): LogColor {
        throw new Error()
    }
}

export class LevelColoringStrategy extends ColoringStrategy {

    constructor(private _logMethodColors: Record<LogMethod, LogColorRGB>) {
        super();
    }

    public getColor(context: LogContext): LogColorRGB {
        return this._logMethodColors[context.method]
    }
}


function ColorTransform(strategy: ColoringStrategy) {

    // create transform
    return function (context: LogContext) {

        // get color
        const color = strategy.getColor(context)

        // TODO: abstract the transforming from color -> message
        // apply color to message
        let message = context.message;
        const isDesktop = true;
        if (isDesktop) {

            // convert the color to a Chalk
            const chalk = isRGB(color)
                ? Chalk.rgb(color.red, color.green, color.blue)
                : Chalk.hsl(color.hue, color.saturation, color.lightness)

            // convert message
            message = chalk(message)
        }

        // apply for browser
        else {
            throw new NotImplementedError('Browser support coming soon!');
        }

        // return transfomed context
        return Object.assign({}, context, {message});
    }
}


function test() {

    Scribe.transform = ColorTransform(new NamespaceColoringStrategy())
    // Scribe.transform = ColorTransform(new LevelColoringStrategy({
    //     debug:
    // }))
}

