# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.0.1"></a>
## [1.0.1](https://github.com/ngxp/builder/compare/v1.0.0...v1.0.1) (2019-09-18)


### Bug Fixes

* blueprint builder methods for optional properties are typed as possibly undefined ([c6b42cf](https://github.com/ngxp/builder/commit/c6b42cf))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/ngxp/builder/compare/v0.4.1...v1.0.0) (2019-03-21)


### Bug Fixes

* event-stream vulnerability ([da98370](https://github.com/ngxp/builder/commit/da98370))
* typing issue in blueprint builder ([362876d](https://github.com/ngxp/builder/commit/362876d))


### Features

* accept an array of initial transformations ([639ca43](https://github.com/ngxp/builder/commit/639ca43))
* rename to [@ngxp](https://github.com/ngxp)/builder ([8008818](https://github.com/ngxp/builder/commit/8008818))
* return a new builder instance for each additional transformation ([fee9381](https://github.com/ngxp/builder/commit/fee9381))


### BREAKING CHANGES

* transformation parameter and return value are now Partial<T>



<a name="0.4.0"></a>
# [0.4.0](https://github.com/ngxp/builder/compare/v0.3.0...v0.4.0) (2018-08-05)


### Features

* add freeze method to builder ([7d9a003](https://github.com/ngxp/builder/commit/7d9a003))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/ngxp/builder/compare/v0.2.7...v0.3.0) (2018-08-04)


### Features

* allow blueprint to be factory method that returns a blueprint ([05edc1b](https://github.com/ngxp/builder/commit/05edc1b))



<a name="0.2.7"></a>
## [0.2.7](https://github.com/ngxp/builder/compare/v0.2.6...v0.2.7) (2018-07-17)



<a name="0.2.6"></a>
## [0.2.6](https://github.com/ngxp/builder/compare/v0.2.5...v0.2.6) (2018-07-17)



<a name="0.2.5"></a>
## [0.2.5](https://github.com/ngxp/builder/compare/v0.2.4...v0.2.5) (2018-07-17)



<a name="0.2.4"></a>
## [0.2.4](https://github.com/ngxp/builder/compare/v0.2.3...v0.2.4) (2018-07-16)



<a name="0.2.3"></a>
## [0.2.3](https://github.com/ngxp/builder/compare/v0.2.2...v0.2.3) (2018-07-16)



<a name="0.2.2"></a>
## [0.2.2](https://github.com/ngxp/builder/compare/v0.2.1...v0.2.2) (2018-07-16)



<a name="0.2.1"></a>
## [0.2.1](https://github.com/ngxp/builder/compare/v0.2.0...v0.2.1) (2018-07-16)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ngxp/builder/compare/v0.1.0...v0.2.0) (2018-07-16)



<a name="0.1.0"></a>
# 0.1.0 (2018-07-16)


### Bug Fixes

* compile lodash-es with babel to fix es2015 import issue ([c3a8370](https://github.com/ngxp/builder/commit/c3a8370))


### Features

* initial implementation of createBuilder and createBlueprintBuilder ([dc13e4c](https://github.com/ngxp/builder/commit/dc13e4c))
