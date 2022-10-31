# Lab 1

## Perfomers

Vasylenko Pavlo IP-02
Kostyanko Vadym IA-03

## Goals

- Make an acquaintance with native http api in NodeJS
- find difference between commonjs/esm
- find out what is that strange thing called `URL`

## Task

Build small http server with router without using any framework. Use ESM modules for project.
Server should include simple router, write it yourself. Please add 3-6 routes.

### Requirements

- change default loader to ECMAScript module loader.
- support different HTTP Methods (POST, GET, OPTIONS) for one route
- support 2+ different content types (json, xml, formdata, urlencode)
- follow specification for JSON: https://jsonapi.org/
- handle graceful shutdown

## Questions

- why we have separate http and https?
- Is it good idea to parse urls with REGEX?
