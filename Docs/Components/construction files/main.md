# Matryoshka Construction File — Syntax Reference v0.3

## 1. Core idea

A Matryoshka construction file describes:

```text
global networks
global modes
containers
```

Each container contains a simple ordered sequence of instructions.

There is no separate `BUILD`, `RUN`, `CONFIG`, or `STEPS` section.

The structure is intentionally flat:

```text
container
    ↓
ordered instructions
```

Example:

```yaml
NETWORKS:

  - frontend
  - backend


MODES:

  BUILD: parallel
  LAUNCH: parallel


CONTAINERS:

  backend:

    - FROM: alpine

    - COPY:
        FROM: "host:./app"
        TO: "this:/app"

    - RUN: "apk add gcc"

    - RUN: "gcc /app/main.c -o /app/backend"

    - NETWORKS:
        - backend

    - EXPOSE:
        - 8080

    - PORT:
        - "8080:8080"

    - PRIORITY: 2

    - CMD: "/app/backend"
```

---

## 2. Top-level structure

There are three top-level concepts:

```yaml
NETWORKS:
  ...

MODES:
  ...

CONTAINERS:
  ...
```

### NETWORKS

Defines the named networks available to the application.

### MODES

Defines how building and launching are scheduled.

### CONTAINERS

Defines the containers and their construction/runtime configuration.

---

## 3. NETWORKS

Networks are named logical networks.

Example:

```yaml
NETWORKS:

  - frontend
  - backend
  - database
```

Containers can join one or more networks.

For example:

```yaml
backend:

  - NETWORKS:
      - frontend
      - backend
```

This means the container belongs to both networks.

Networks themselves do not contain configuration such as:

```text
IP addresses
subnets
bridges
veth pairs
routing
NAT
firewall rules
```

Those are implementation details handled by the Matryoshka runtime.

The construction file only expresses the desired network topology.

---

## 4. MODES

`MODES` controls how containers are built and launched.

```yaml
MODES:

  BUILD: parallel
  LAUNCH: parallel
```

Both modes support:

```text
parallel
sequence
```

### BUILD: parallel

Independent container builds may execute concurrently.

For example:

```text
container A ───────► finished
container B ───────► finished
container C ───────► finished
container D ───────► finished
```

The instructions inside each individual container remain ordered.

### BUILD: sequence

Containers are built sequentially:

```text
A → B → C → D
```

### LAUNCH: parallel

Containers that are eligible to launch at the same priority level may start concurrently.

### LAUNCH: sequence

Containers are launched sequentially according to their priority.

---

## 5. CONTAINERS

Each container has a name.

Example:

```yaml
CONTAINERS:

  postgres:
    ...

  backend:
    ...

  frontend:
    ...
```

The name is the logical identity of the container.

It can also be used by the runtime for container-to-container service discovery.

---

## 6. Container instructions

A container contains one ordered list of instructions.

Example:

```yaml
backend:

  - FROM: alpine

  - COPY:
      FROM: "host:./backend"
      TO: "this:/app"

  - RUN: "apk add gcc"

  - RUN: "gcc /app/main.c -o /app/backend"

  - NETWORKS:
      - backend

  - EXPOSE:
      - 8080

  - PORT:
      - "8080:8080"

  - PRIORITY: 2

  - CMD: "/app/backend"
```

The list is simply the YAML representation of an ordered instruction stream.

There is no additional `STEPS` abstraction.

---

## 7. One instruction per line

Instructions remain simple and explicit.

For example:

```yaml
- RUN: "apk update"
- RUN: "apk add gcc"
- RUN: "gcc main.c -o app"
```

Each `RUN` represents one command.

There is no nested collection of commands underneath `RUN`.

If three commands are required, write three `RUN` instructions.

---

## 8. Build instructions

The build instructions are:

```text
FROM
COPY
RUN
```

These are responsible for constructing the container filesystem.

The instructions execute in order within each container.

For example:

```yaml
backend:

  - FROM: alpine

  - COPY:
      FROM: "host:./src"
      TO: "this:/src"

  - RUN: "apk add gcc"

  - RUN: "gcc /src/main.c -o /app/backend"
```

The resulting process is conceptually:

```text
FROM alpine
    ↓
COPY source
    ↓
RUN apk add gcc
    ↓
RUN gcc ...
    ↓
final filesystem
```

The build environment itself is containerized.

Each build layer is executed in an isolated temporary build container, and the resulting filesystem becomes the basis for the next layer.

---

## 9. FROM

`FROM` establishes the initial filesystem for the container.

Examples:

```yaml
- FROM: alpine
```

or:

```yaml
- FROM: "./alpinerootfs"
```

The source may refer to a root filesystem available to the engine.

---

## 10. COPY

`COPY` copies files from one filesystem location to another.

It always contains two mandatory fields:

```text
FROM
TO
```

Example:

```yaml
- COPY:
    FROM: "host:./app"
    TO: "this:/app"
```

The direction is always explicit:

```text
FROM → TO
```

---

## 11. Filesystem location prefixes

Locations use explicit prefixes.

### `host:`

Refers to the host/project filesystem.

Example:

```yaml
FROM: "host:./app"
```

This means:

```text
project/app
```

on the host side.

### `this:`

Refers to the filesystem currently being constructed.

Example:

```yaml
TO: "this:/app"
```

This means:

```text
/app
```

inside the current container filesystem.

### Named filesystem references

A previously named build result may be referenced by name.

For example:

```yaml
FROM: "layer1:/app/backend"
```

This allows files from that filesystem to be copied into the current filesystem.

---

## 12. Host paths

A host path is explicitly marked with `host:`.

Example:

```yaml
- COPY:
    FROM: "host:./application"
    TO: "this:/app"
```

This makes the source unambiguous.

The construction file therefore does not have to guess whether:

```text
./application
```

means a host path or a path inside the current filesystem.

---

## 13. Runtime BIND

`BIND` is a runtime configuration instruction.

It describes a one-to-one mapping between a host directory and a directory inside the running container.

Example:

```yaml
- BIND:
    FROM: "host:./data"
    TO: "this:/app/data"
```

Conceptually:

```text
host ./data
     │
     ▼
container /app/data
```

The important distinction is that this mapping is **not part of filesystem construction**.

The engine records it as part of the final runtime configuration.

Multiple binds are supported:

```yaml
- BIND:
    FROM: "host:./data"
    TO: "this:/app/data"

- BIND:
    FROM: "host:./config"
    TO: "this:/app/config"

- BIND:
    FROM: "host:./logs"
    TO: "this:/app/logs"
```

---

## 14. NETWORKS inside a container

`NETWORKS` specifies which named networks the running container joins.

Example:

```yaml
- NETWORKS:
    - frontend
    - backend
```

A container can belong to multiple independent networks.

For example:

```text
             ┌── frontend
container ───┤
             └── backend
```

This does not mean that `frontend` and `backend` themselves become connected.

The container simply has membership in both.

---

## 15. EXPOSE

`EXPOSE` declares ports provided by the container.

Example:

```yaml
- EXPOSE:
    - 8080
    - 8443
```

Multiple ports are supported.

`EXPOSE` describes the container-side ports.

It does not by itself publish those ports on the host.

---

## 16. PORT

`PORT` creates a host-to-container port mapping.

Example:

```yaml
- PORT:
    - "8080:8080"
```

The format is:

```text
host-port:container-port
```

Therefore:

```text
8080:8080
```

means:

```text
host port 8080
        ↓
container port 8080
```

Multiple mappings are supported:

```yaml
- PORT:
    - "8080:8080"
    - "8443:443"
```

This is runtime configuration.

---

## 17. PRIORITY

`PRIORITY` controls launch ordering.

Example:

```yaml
postgres:

  - FROM: alpine
  - RUN: "install-postgres"

  - PRIORITY: 1

  - CMD: "postgres"


backend:

  - FROM: alpine
  - RUN: "build-backend"

  - PRIORITY: 2

  - CMD: "/app/backend"
```

The runtime interprets this as:

```text
Priority 1
    postgres

Priority 2
    backend
```

If multiple containers have the same priority:

```text
Priority 1:
    postgres
    redis
    message-queue

Priority 2:
    backend
    worker

Priority 3:
    frontend
```

containers within the same priority level can launch according to the selected `LAUNCH` mode.

Priority is purely a runtime concern.

---

## 18. CMD

`CMD` defines the final command executed when the container starts.

Example:

```yaml
- CMD: "/app/backend"
```

It may also contain arguments:

```yaml
- CMD:
    - "/app/backend"
    - "--config"
    - "/app/config.yml"
```

`CMD` is runtime configuration.

It is not executed during construction.

---

## 19. Runtime configuration

The runtime-related instructions are:

```text
BIND
NETWORKS
EXPOSE
PORT
PRIORITY
CMD
```

They describe the final container execution environment.

The user does not need to create a separate runtime section.

For example:

```yaml
backend:

  - FROM: alpine

  - COPY:
      FROM: "host:./src"
      TO: "this:/src"

  - RUN: "gcc /src/main.c -o /app/backend"

  - NETWORKS:
      - backend

  - BIND:
      FROM: "host:./data"
      TO: "this:/app/data"

  - EXPOSE:
      - 8080

  - PORT:
      - "8080:8080"

  - PRIORITY: 2

  - CMD: "/app/backend"
```

The parser internally understands that:

```text
FROM
COPY
RUN
```

construct the filesystem, while:

```text
NETWORKS
BIND
EXPOSE
PORT
PRIORITY
CMD
```

become runtime configuration.

The syntax itself remains one flat instruction stream.

---

## 20. Complete current keyword set

The current construction language consists of:

### Global

```text
NETWORKS
MODES
CONTAINERS
```

### Build

```text
FROM
COPY
RUN
```

### Runtime

```text
BIND
NETWORKS
EXPOSE
PORT
PRIORITY
CMD
```

### Filesystem location prefixes

```text
host:
this:
```

plus named filesystem references where applicable.

That is the entire current language model. The goal is to keep it small enough that a construction file remains easy to read, parse, and implement.
