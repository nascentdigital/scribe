# Scribe
> Finally, a full featured Javascript logging framework for the both browser and Node.

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

### Basics

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
a namespace is a follows:

`module:`

###### mylib/foo.js
```javascript
import {Scribe} from "@nascentdigtal/scribe";

const log = Scribe.getLog("mylib:foo");

export function foo() {

}
```
