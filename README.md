# staytouch-task

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Features

Node.js with Express and Apollo Server
PostgreSQL Database with Sequelize ORM
JWT Authentication
Signed images uplaod to AWS s3 bucket

### Prerequisites

What things you need to install the software and how to install them

```
Node@v12.x.x
PostgreSql@12.x
```

### Installing

A step by step series that will tell you how to get a development env running

```
$ cd server
```

```
$ npm ci
```

### DataBase Migrations

Create Database:
```
$ node_modules/.bin/sequelize db:create --url 'dialect://username:password@host:port/database_name'
```
| keyword       | Example         |Description                        |
| ------------- | --------------- |---------------------------------- |
| dialect       | postgres        |Database we are using              |
| username      | root            |Username for the database          |
| password      | postgres        |Password for the database          |
| host          | localhost/IP    |Host on which database is running  |
| port          | 5432            |Port for the database              |
| database_name | sample_database |Database name|

Create Migrations:
```
$ node_modules/.bin/sequelize migration:create --name migration_name
```

Run Migrations:
```
$ node_modules/.bin/sequelize db:migrate --url 'dialect://username:password@host:port/database_name'
```
| keyword       | Example         |Description                                     |
| ------------- | --------------- |----------------------------------------------- |
| dialect       | postgres        |Database we are using                           |
| username      | root            |Username for the database                       |
| password      | postgres        |Password for the database                       |
| host          | localhost/IP    |Host on which database is running               |
| port          | 5432            |Port for the database                           |
| database_name | sample_database |Database name from which migrations will happen |

## Run the Server
```
$ npm run start
```
## With Docker container
```

$ docker build  -t  staytouch:latest . 

$ docker run  -it  staytouch:latest .

```

### Remove all images

```bash
#!/bin/bash
docker rmi $(docker images -q)

docker rmi <image-id> --- remove single docker image
```

