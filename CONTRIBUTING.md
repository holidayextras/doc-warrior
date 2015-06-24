# Contributing to DocWarrior

The following is a set of guidelines for contributing to DocWarrior, these are just guidelines, not rules, use your best judgement and feel free to propose changes to this document in a pull request.

## Adding Rules
Feel free to add extra rules to DocWarrior, the only stipulation is that they must be generic and contain no business logic so that the rules can beneift everyone. So, rather than a rule for ifFooEqualsBar we've used equals!

## Adding Connectors
We're keen to seen more connectors added to DocWarrior! There are just a couple of things your connector must do in order to be accepted:

* Must expose a `getDocument` function
* The `getDocument` function must return an object containing content and rules (example below)
* If date parameter is passed in, must select document active on that date
* If date parameter is not passed in, must select latest version of requested document

##### Example getDocument return
```javascript
{
  content: 'An equally basic readme that wants nothing to do with foo bar!',
  rules: {
    notEquals: {
      foo: ['bar', 'baz']
    },
    equals: {
      another: ['[param']
    }
  }
}
```

## Pull Requests

* Include well worded and comprehensive mocha tests, at minimum unit tests for all code paths.
* Consider including an emoji in a pull request title:
  * :new: `:new:` when fixing adding a new component
  * :bug: `:bug:` when fixing a bug
  * :racehorse: `:racehorse:` when improving performance
  * :memo: `:memo:` when writing docs
  * :fire: `:fire:` when removing code or files
  * :lock: `:lock:` when dealing with security
  * :arrow_up: `:arrow_up:` when upgrading dependencies
  * :arrow_down: `:arrow_down:` when downgrading dependencies
