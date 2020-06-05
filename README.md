# Scribe
> Finally, a full featured Javascript logging framework for the both browser and Node.

[![NPM version](https://img.shields.io/npm/v/@nascentdigital/scribe.svg)](https://www.npmjs.com/package/@nascentdigital/scribe)
[![downloads](https://img.shields.io/npm/dm/@nascentdigital/scribe.svg)](http://npm-stat.com/charts.html?package=@nascentdigital/scribe&from=2020-06-05)
[![Node version](https://img.shields.io/node/v/@nascentdigital/scribe.svg)](http://nodejs.org/download/)
[![Build Status](https://travis-ci.com/nascentdigital/scribe.svg?branch=master)](https://travis-ci.com/nascentdigital/scribe.svg?branch=master)
[![Code Coverage](https://img.shields.io/codecov/c/github/nascentdigital/scribe.svg)](https://codecov.io/github/nascentdigital/scribe)



## Features
- Namespace support for fine-grained logging support at a module, feature, or method level.
- Log level support to enable prioritized log output.
- Dynamic configuration of log level mappings based on namespaces patterns.
- Pluggable middleware transform of log output (e.g. prefixing, colors, custom, etc.)
- Pluggable writers of log output (e.g. console, null, server-side, custom, etc.)
- Built in Typescript, compatible with Javascript.


## Installation

Install Scribe using [`npm`](https://www.npmjs.com/):

```bash
npm install --save @nascentdigital/scribe
```

Or [`yarn`](https://yarnpkg.com/en/package/jest):

```bash
yarn add @nascentdigital/scribe
```


## Usage

### Quick Start

Getting started is really easy.  Simply acquire a `Log` and start logging:

```javascript
import {Scribe} from "@nascentdigtal/scribe";

Scribe.log.debug("A debug message");
// A debug message

Scribe.log.error("An error occurred - ", new Error("Oops!"));
// An error occurred - Error: Oops!
//   at ...
```

This example uses the global log to output a `debug` and `error` [level](#log-levels) log message.  While this is a
quick way to access and output log messages, the recommended approach is to use [namespaces](#namespaces).


### Namespaces

In modern Javascript we organize our code into [modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
which build up larger libraries and applications.  Good logging should reflect the [separation of concerns](https://effectivesoftwaredesign.com/2012/02/05/separation-of-concerns/)
modelled by the application architecture.

`Scribe` uses namespaces to help developers group and control logging based on related functionality.  The structure of
a namespace is as follows:

|               |                                                  |
|---------------|--------------------------------------------------|
|**namespace**  | `<identifier>`:`<identifier>`/`<identifier>`*    |
|**identifier** | `[a-zA-Z0-9_]`                                   |
|               |                                                  |


Some examples of valid namespaces would be:

- `"myapp"`
- `"myapp:mymodule"`
- `"myapp:mymodule/foo"`
- `"myapp:mymodule/foo/bar"`
- `"myapp:mymodule/foo/bar/variant"`

### Retrieving a Log

A log can be obtained by accessing the global `Scribe.log` property:

 ```javascript
const globalLog = Scribe.log;
```

Generally you'll want to fetch a log that is dedicated to a specific scope.  You can obtain a specific logger via the
`Scribe.getLog()` method.  This method creates a log if it doesn't exist or fetches the cached log if it has already
been created.

```javascript
const logA = Scribe.getLog("moduleA");
const logB = Scribe.getLog("moduleB");
const logA2 = Scribe.getLog("moduleA");

logA.debug(logA === logA2); // true
```

In practice, you'll want to dedicate a log per module and scope the namespace to reflect that relationship.

###### mylib/foo.js
```javascript
const log = Scribe.getLog("mylib:foo");

export function foo(options) {

    if (!options) {
        log.error("foo() invoked without options");
        throw new Error("Missing 'options' argument.");
    }

    log.trace("calling foo with options: ", options);
}
```

###### mylib/bar.js
```javascript
const log = Scribe.getLog("mylib:bar");

export function bar(message) {
    log.debug("bar() was invoked with message: ", message);
}
```


### Log Levels

Log levels provide a way of prioritizing the significance of a log message.  The `Log` interface has log methods the
correspond communicate the following intent around log messages:

| Level         | Method      | Description
|---------------|-------------|---------------------
| Trace         | `trace()`   | Used for profiling an application and seeing the details of control flow.  This is a very noisy level that should be reserved for situations that require coding forensics.  Generally trace messages also provide clarity of the stacktrace.
| Debug         | `debug()`   | This level represents the sweet spot for debugging messages that help developers see the internals of their code when tracking down most bugs.
| Informational | `info()`    | These usually represent lifecycle events our communicate the result of larger milestones.
| Warning       | `warn()`    | Warnings are used to communicate anomalies in the code that aren't errors but might be symptoms of underlying issues.  They of show in validation or edge case concerns that the code can handle, but shouldn't really occur.
| Error         | `error()`   | This is for problems that are almost accompanied with the throwing or catching of `Error`s.  Similar to `trace` messages, this level usually provides a stacktrace when logging.
| Silent        | *n/a*       | This level doesn't provide a log function because it effectively disables all logging when enabled.

The levels are cumulative in the sense that they stack.  When `trace` level logging is enabled all other log level are
automatically enabled as well, while `debug` enables all levels except `trace`.  Outside of silent, the `error` level is
the most strict level and will result in the other messages being suppressed.

Here's an example of how these


### Log Filters

Most of the time you'll want to control which of the log levels actually get output to the console.  The
`Scribe.setLogLevel()` method give precise control of individual log levels by targeting namespaces.  This method
uses the `*` wildcard to help create glob expressions that can cover many different scenarios.

Filters can be set before or after a log is created, and is guaranteed to take precedence based on the most recently
set filter that matches a namespace.  The default level for logs is `error` if there is no overridden match.

```javascript

// create a log early
const loginLog = Scribe.getLog("myapp:onboarding/login");

// change default level to info, make onboarding debug
Scribe.setLogLevel("*", "info");
Scribe.setLogLevel("myapp:onboarding*", "debug");

// show some logging
loginLog.trace("suppressed");
loginLog.debug("OUTPUT")
loginLog.error("OUTPUT");

// late binding of another log
const homeLog = Scribe.getLog("myapp:home");

// use the new log
homeLog.debug("suppressed");
homeLog.warn("OUTPUT");
homeLog.error("OUTPUT");
```


### Advanced Configuration

#### Transforms


#### Writers

