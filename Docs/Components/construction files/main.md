# Matryoshka Construction File — Syntax Reference v0.1

## 1. Purpose

A Matryoshka construction file is the declarative source for an application made of one or more containers.

It has two responsibilities:

1. **Build** the filesystem/application artifacts.
2. **Describe how those finished artifacts are launched and connected at runtime.**

The file is therefore compiled by the Matryoshka Engine into:

```text
Construction File
        │
        ├── BUILD PLAN
        │      └── filesystem/artifact construction
        │
        └── RUNTIME PLAN
               ├── startup ordering
               ├── dependencies
               ├── networks
               ├── ports
               ├── binds
               └── commands
```

The fundamental distinction is:

```text
BUILD DEPENDENCY
    controls construction

RUNTIME DEPENDENCY
    controls startup order

NETWORK
    controls communication topology
```

These three concepts are independent.

---

# 2. Top-level structure

The canonical file structure is:

```yaml
NETWORKS:
  ...

MODES:
  BUILD: parallel
  LAUNCH: parallel

CONTAINERS:

  container-name:
    BUILD:
      ...

    CONFIG:
      ...

    RUN:
      ...
```

The sections are:

```text
NETWORKS
    Declares the available named networks.

MODES
    Defines how building and launching are scheduled.

CONTAINERS
    Defines the application's containers.

BUILD
    Describes how a container's filesystem/artifact is constructed.

CONFIG
    Holds static configuration associated with the resulting container/artifact.

RUN
    Describes the final runtime behavior and topology.
```

---

# 3. NETWORKS

Networks are declared globally by name.

```yaml
NETWORKS:
  - frontend
  - backend
  - database
  - monitoring
```

A network declaration contains only its name.

The construction language does not expose low-level networking details such as:

```text
IP addresses
subnets
bridges
veth pairs
routing
NAT
firewall rules
network namespaces
```

Those are implementation details of the Matryoshka runtime.

A container may belong to any number of networks.

For example:

```yaml
RUN:
  NETWORKS:
    - frontend
    - backend
    - monitoring
```

means that the container is attached to all three networks.

There is no implied relationship between the networks themselves.

For example:

```text
frontend
backend
database
```

are three independent networks even if the same container belongs to more than one.

---

# 4. MODES

The `MODES` section controls global scheduling behavior.

```yaml
MODES:
  BUILD: parallel
  LAUNCH: parallel
```

Valid values are:

```text
parallel
sequence
```

## BUILD mode

```yaml
MODES:
  BUILD: parallel
```

means independent container builds may run concurrently.

For example:

```text
A ───────────────► finished
B ───────────────► finished
C ───────────────► finished
D ───────────────► finished
```

All four may be building at the same time.

If:

```text
C depends on A
```

then C waits for A:

```text
A ─────────► finished
              │
              ▼
C ─────────► build
```

The existence of a dependency does not serialize unrelated builds.

With:

```yaml
MODES:
  BUILD: sequence
```

container builds are performed sequentially.

Conceptually:

```text
A ─► B ─► C ─► D
```

## LAUNCH mode

```yaml
MODES:
  LAUNCH: parallel
```

means all containers that are currently eligible to start may be launched concurrently.

With:

```yaml
MODES:
  LAUNCH: sequence
```

containers are launched one at a time according to the runtime scheduler's ordering rules.

---

# 5. CONTAINERS

Every application container is declared under `CONTAINERS`.

```yaml
CONTAINERS:

  postgres:
    BUILD:
      ...

    CONFIG:
      ...

    RUN:
      ...

  backend:
    BUILD:
      ...

    CONFIG:
      ...

    RUN:
      ...
```

The container name is its logical identity inside the construction file.

It is used by runtime dependencies:

```yaml
DEPENDS_ON:
  - postgres
```

and may also be used by the runtime for service discovery where appropriate.

---

# 6. BUILD

`BUILD` defines how the container's filesystem/artifact is manufactured.

The main structure is:

```yaml
BUILD:

  STEPS:
    - ...
    - ...
    - ...
```

`STEPS` is always a list.

It is not a tree of arbitrary nested commands.

Conceptually:

```text
BUILD
└── STEPS
      ├── Layer 1
      ├── Layer 2
      ├── Layer 3
      └── Layer 4
```

Each layer represents one construction step.

---

# 7. Build layers

A build layer is an actual temporary containerized execution environment.

The basic idea is:

```text
previous filesystem
        │
        ▼
 create temporary build container
        │
        ├── bind resources
        ├── attach networks
        ├── wait for dependencies
        ├── run command(s)
        │
        ▼
 commit resulting filesystem
        │
        ▼
 next layer
```

Therefore a build layer can have real runtime-like characteristics.

A layer may have:

```text
RUN
BIND
UNBIND
NETWORKS
DEPENDS_ON
```

in addition to filesystem operations such as:

```text
FROM
COPY
```

The layer's environment is temporary.

Its runtime configuration is not automatically carried into the final application container.

For example:

```yaml
BUILD:
  STEPS:

    - BIND: "/resources:/resources"
    - RUN: "generator /resources" 
```


The `/resources` bind exists for the build container executing this layer.

It does not automatically become a runtime bind.

---

# 8. Single-command layers

A layer can contain one command:

```yaml
STEPS:

  - RUN: "gcc main.c -o app"
```

This creates one temporary build container, executes the command, and commits the resulting filesystem state.

---

# 9. Multi-command layers

A layer may contain multiple commands:

```yaml
STEPS:

  - RUN:
      - "apk update"
      - "apk add gcc"
      - "gcc main.c -o app"
    
```

Commands in the same layer are executed sequentially:

```text
command 1
   │
   ▼
command 2
   │
   ▼
command 3
```

The global `BUILD` mode controls concurrency between build units/containers, not the order of commands inside one layer.

---

# 10. FROM

`FROM` creates a new filesystem starting point.

Examples:

```yaml
- FROM: alpine
  SOURCE: Docker
```

```yaml
- FROM: "./alpinerootfs" 
```

`FROM` may refer to a root filesystem/image known to Matryoshka.

The language supports explicitness.

For example:

```text
FROM alpine
```

may be written explicitly as:

```text
FROM -rootfs alpine
```

when the user wants to make the interpretation explicit.

The exact set of future `FROM` source types can be extended without changing the rest of the language.

---


## also you might do something like this

```yaml

- FROM: host # remmember; host is preserved keyword

- RUN: git pull somerootfs ./here # the engine uses relative path of the cinstruction file
  AS:  pull the rfs # this resolves to utf8 string so feel free to leave spaces

- FROM: "./here/rootfs"

- CLEAN: pull the rfs
```

> The `CLEAN` Keyword cleans any filesystem changes made in that layer, simply it restores to the previous layer 

also quick note: *FROM host does not run in host's global mount namespace, it runs on host's root filesystem in isolated enviroment, therefore your app can use the host's file system without messing with it*


# 11. Named build layers

A build layer may have a name so that its resulting filesystem can be referenced later.

Conceptually:

```yaml
- FROM: alpine
  AS: layer1
```

A later step can reference the named layer:

```yaml
- COPY:
    - "layer1:/app/executable"
    - "this:/app"
```

The exact source-prefix convention is:

```text
host:
    source is from the host filesystem

this:
    source is from the current filesystem state

<layer-name>:
    source is from a previously named layer/artifact
```

Example:

```yaml
- COPY:
    - "host:./app"
    - "this:/app"
```

and:

```yaml
- COPY:
    - "layer1:/app/executable"
    - "this:/app"
```

A bare path may use the default interpretation appropriate to the position of the path.

The explicit prefixes exist to remove ambiguity.

---

# 12. COPY

`COPY` copies data from one location into another filesystem state.

Conceptually:

```text
COPY <source> <destination>
```

Example:

```yaml
- COPY:
    - "host:./app"
    - "this:/app"
```

This means:

```text
host ./app
      │
      ▼
current /app
```

A source may also originate from a named previous layer:

```yaml
- COPY:
    - "layer1:/app/executable"
    - "this:/app"
```

The destination normally refers to the current build filesystem unless another explicit destination namespace is introduced later.

---

# 13. Build-time BIND

`BIND` inside `BUILD` is a temporary build bind.

Example:

```yaml
- BIND:
    - "/resources:/resources"
  RUN: "generator --src /resources"
```

The build container sees:

```text
host /host/resources
          │
          ▼
container /resources
```

The bind exists for that layer's execution.

It is not part of the final container unless a separate runtime bind is declared under `RUN`.

This gives two semantically distinct kinds of binds:

```text
BUILD BIND
    temporary
    used to construct the artifact

RUNTIME BIND
    persistent
    used by the final running container
```

---

# 14. Multiple build-time binds

A layer can use multiple binds:

```yaml
- BIND:
    - "/host/src:/src"
    - "/host/resources:/resources"
    - "/host/tools:/tools"

  RUN:
    - "prepare /src"
    - "generate /resources"
    - "compile /tools"
```

All of the specified bindings are active for the layer.

---

# 15. Build-time NETWORKS

Since every build layer is an actual containerized environment, a layer may have network configuration.

Example:

```yaml
- NETWORKS:
    - build-network

  RUN: "download-dependencies"
```

The temporary build container is attached to the named network while the layer executes.

This is a build-time network relationship.

It does not imply that the final runtime container will use that network.

Runtime networking is declared separately under `RUN`.

---

# 16. Build-time DEPENDS_ON

`DEPENDS_ON` inside `BUILD` is a build dependency.

It controls construction scheduling.

Example:

```yaml
BUILD:
  STEPS:

    - DEPENDS_ON:
        - toolchain

      RUN: "compile"
```

The layer cannot execute until its build dependency is available.

The important meaning is:

```text
BUILD DEPENDS_ON
    "I cannot perform this construction step until the dependency's
     required build state has been completed."
```

It is not a runtime dependency.

It is not a network connection.

It does not imply anything about the final application's startup order.

---

# 17. Build dependency scheduling

Suppose:

```text
container A
container B
container C

C BUILD DEPENDS_ON A
```

and:

```yaml
MODES:
  BUILD: parallel
```

The scheduler may do:

```text
A ──────────────────► finished
B ──────────────────► finished
C      waiting ──────► build
```

B does not have to wait for A.

Only the dependency-constrained unit waits.

Build dependencies therefore form a dependency graph.

For example:

```text
A ─────► C
B ─────► C
C ─────► D
```

C cannot begin until both A and B satisfy their required build state.

D cannot begin until C is complete.

---

# 18. ROLLBACK

> ROLLBACK is Expiremental

`ROLLBACK` is a build-time filesystem operation.

Example:

```yaml
- ROLLBACK: layer1
```

It means:

```text
restore the current filesystem state
to the filesystem state represented by layer1
```

The following steps then continue from that restored state.

Example:

```yaml
BUILD:

  STEPS:

    - FROM:
        source: alpine
        AS: base

    - RUN: "step-a"

    - FROM:
        source: current
        AS: layer1

    - RUN: "step-b"

    - ROLLBACK: layer1

    - RUN: "step-c"
```

After rollback, `step-c` starts from the filesystem represented by `layer1`.

`ROLLBACK` is a build-state operation.

It does not mean:

```text
restart a running container
stop a container
restore runtime state
```

---

# 19. Nested build layers

The language permits limited nesting for build-layer grouping/scoping.

A nested layer inherits the enclosing scope.

Example:

```yaml
BUILD:

  BIND:
    - "/host/common:/common"

  STEPS:

    - RUN: "step1"

    - STEPS:

        - RUN: "nested-step1"
        - RUN: "nested-step2"
```

The maximum supported nesting depth is intentionally limited.

The language is not intended to become:

```text
layer
  └── layer
       └── layer
            └── layer
                 └── layer
                      ...
```

The intended model is shallow:

```text
container
   │
   └── BUILD
         │
         └── STEPS
               ├── layer
               ├── layer
               ├── layer
               │
               └── nested layer
```

This preserves scope inheritance without creating an unreadable construction tree.

---

# 20. Scope and closure semantics

Matryoshka uses lexical-style scope inheritance.

A child scope can see values declared by its parent scope.

Conceptually:

```text
GLOBAL
  │
  └── CONTAINER
        │
        ├── BUILD
        │     │
        │     └── LAYER
        │            │
        │            └── NESTED LAYER
        │
        └── RUN
```

A nested scope can access inherited settings without repeating them.

For example:

```yaml
backend:

  BUILD:

    BIND:
      - "/host/common:/common"

    NETWORKS:
      - build-network

    STEPS:

      - RUN: "step1"

      - RUN: "step2"

      - STEPS:
          - RUN: "nested-step"
```

The nested layer sees:

```text
/common
build-network
```

because they are inherited from the enclosing build scope.

---

# 21. Scope inheritance

The effective configuration of a layer is:

```text
local configuration
+
inherited parent configuration
```

For collection-type properties such as:

```text
BIND
NETWORKS
DEPENDS_ON
```

the inherited entries are part of the layer's effective configuration.

A local scope may add additional entries.

For example:

```yaml
BUILD:

  BIND:
    - "/host/common:/common"

  STEPS:

    - BIND:
        - "/host/project:/project"

      RUN: "compile"
```

The effective bindings for that layer are:

```text
/host/common  → /common
/host/project → /project
```

---

# 22. UNBIND

`UNBIND` removes an inherited or previously declared binding from the effective scope.

Conceptually:

```yaml
BUILD:

  BIND:
    - "/host/common:/common"

  STEPS:

    - UNBIND: "/common"

      RUN: "command"
```

The layer does not receive `/common`.

A named bind may also be removed by name when named bind objects are used.

`UNBIND` affects the effective scope from that point onward and can therefore be inherited by nested scopes.

The exact bind identity rules remain part of the implementation contract to be finalized.

---

# 23. CONFIG

`CONFIG` is reserved for configuration that belongs to the resulting artifact/container but is not itself a build operation or runtime topology operation.

Example:

```yaml
CONFIG:
  ...
```

The important rule is:

```text
CONFIG
    is not BUILD
    is not RUN
```

In particular, runtime resources should not be hidden inside `CONFIG`.

These belong explicitly under `RUN`:

```text
BIND
PORTS
EXPOSE
NETWORKS
DEPENDS_ON
PRIORITY
CMD
```

The exact list of static `CONFIG` fields is intentionally extensible and has not yet been completely specified.

---

# 24. RUN

`RUN` describes how the finished artifact is executed.

It is the runtime specification of the container.

The core runtime structure is:

```yaml
RUN:

  PRIORITY: 1

  DEPENDS_ON:
    - ...

  NETWORKS:
    - ...

  BIND:
    - ...

  PORTS:
    - ...

  EXPOSE:
    - ...

  CMD: ...
```

Unlike build-time configuration, these settings are intended to survive into the application bundle and be consumed by the Matryoshka runtime.

---

# 25. Runtime PRIORITY

`PRIORITY` defines a startup stage/group.

Example:

```yaml
postgres:
  RUN:
    PRIORITY: 1

redis:
  RUN:
    PRIORITY: 1

backend:
  RUN:
    PRIORITY: 2

frontend:
  RUN:
    PRIORITY: 3
```

The conceptual order is:

```text
Priority 1
    postgres
    redis

Priority 2
    backend

Priority 3
    frontend
```

With:

```yaml
LAUNCH: parallel
```

containers in the same eligible priority group may launch concurrently.

With:

```yaml
LAUNCH: sequence
```

the runtime launches containers sequentially according to its computed order.

Priority does not itself mean communication dependency.

It only establishes launch-stage ordering.

---

# 26. Runtime DEPENDS_ON

`DEPENDS_ON` inside `RUN` is a runtime startup dependency.

Example:

```yaml
backend:

  RUN:

    DEPENDS_ON:
      - postgres
      - redis
```

The meaning is:

```text
postgres must be running
redis must be running
before backend is allowed to start
```

This is an uptime/startup dependency.

It is not a network relationship.

It does not mean that `backend` and `postgres` must share a network.

For example:

```yaml
backend:
  RUN:
    DEPENDS_ON:
      - filesystem-service

    NETWORKS:
      - backend
```

is valid even if `filesystem-service` is accessed through a filesystem mechanism rather than a network.

---

# 27. Runtime dependency state

A dependency is satisfied when the depended-on container reaches the runtime's defined `RUNNING` state.

Conceptually:

```text
CREATED
   │
   ▼
STARTING
   │
   ▼
RUNNING  ← dependency satisfied
```

Therefore:

```text
A DEPENDS_ON B
```

means A waits until B is running.

It does not automatically mean that:

```text
if B later crashes,
A must automatically stop
```

unless a separate lifecycle/restart policy is introduced later.

---

# 28. Networks and DEPENDS_ON are independent

These two declarations should never be interpreted as equivalent.

Example:

```yaml
backend:

  RUN:

    DEPENDS_ON:
      - postgres

    NETWORKS:
      - backend
      - database
```

This means:

```text
Startup:
    postgres must be running first.

Networking:
    backend belongs to backend and database networks.
```

It does not mean that the dependency itself creates the network.

Likewise:

```yaml
frontend:

  RUN:

    NETWORKS:
      - frontend
```

does not imply a dependency on any other container.

---

# 29. Multiple networks

A container may be connected to multiple independent networks.

Example:

```yaml
backend:

  RUN:

    NETWORKS:
      - frontend
      - backend
      - database
```

This allows one container to participate in several network domains.

For example:

```text
             frontend network
frontend ───────────────────── backend
                                   │
                                   │
                              database network
                                   │
                                   ▼
                                postgres
```

The networks do not need to be connected directly to each other.

The container acts as the attachment point to each network.

---

# 30. Runtime BIND

Runtime binds are persistent bindings applied when the final container runs.

Example:

```yaml
RUN:

  BIND:
    - "/host/data:/app/data"
    - "/host/config:/app/config"
    - "/host/logs:/app/logs"
```

These bindings remain part of the runtime specification.

They are fundamentally different from build-time binds.

```text
BUILD BIND
    used while constructing the artifact

RUN BIND
    used while executing the finished artifact
```

There is no implicit conversion between the two.

---

# 31. Runtime PORTS

`PORTS` publishes container ports to the host.

Multiple mappings are allowed.

Example:

```yaml
RUN:

  PORTS:
    - "8080:8080"
    - "8443:443"
    - "9000:9000"
```

The format is:

```text
host-port : container-port
```

Therefore:

```text
8080:8080
```

means:

```text
host port 8080
        │
        ▼
container port 8080
```

and:

```text
8443:443
```

means:

```text
host port 8443
        │
        ▼
container port 443
```

Multiple port mappings are independent and may coexist.

The initial networking model targets TCP.

Additional protocol syntax can be introduced later without changing the general list-based design.

---

# 32. Runtime EXPOSE

`EXPOSE` declares ports provided by the container/application.

Multiple ports are allowed.

Example:

```yaml
RUN:

  EXPOSE:
    - 8080
    - 8443
    - 9000
```

Conceptually:

```text
EXPOSE
    documents/declares the container's internal service ports

PORTS
    publishes selected container ports through the host
```

Therefore:

```yaml
EXPOSE:
  - 8080
```

does not automatically create a host port mapping.

A host publication must be explicitly declared with `PORTS`.

---

# 33. Runtime CMD

`CMD` defines the final entry point for the running container.

Example:

```yaml
RUN:

  CMD: "/app/backend"
```

or:

```yaml
RUN:

  CMD:
    - "/app/backend"
    - "--config"
    - "/app/config.yml"
```

The second form represents an argument vector.

The runtime should ultimately execute the command directly so that the intended workload becomes the main process of the container.

`CMD` belongs to `RUN` because it describes execution of the finished artifact.

---

# 34. VAR

`VAR` is a preprocessor feature.

It is not a runtime configuration mechanism.

Example:

```text
VAR appname myapp
```

A variable is replaced before normal construction parsing.

Conceptually:

```text
source construction file
        │
        ▼
preprocessor
        │
        ▼
expanded construction file
        │
        ▼
parser
```

Therefore variables behave like source-level substitutions.

A variable does not exist merely because a container is running.

It is processed before build/runtime IR is generated.

---

# 35. Build-time macro-like VAR usage

The language may support macro-like expansion such as:

```text
VAR compile RUN "apk update" "apk add gcc"
```

and later:

```text
${compile}
```

or the equivalent syntax defined by the preprocessor.

The exact variable invocation syntax is still an implementation detail to be finalized.

The important rule is:

```text
VAR = preprocessing
```

not:

```text
VAR = runtime environment variable
```

Runtime environment variables, if introduced, should be represented separately.

---

# 36. Separation between BUILD and RUN

The same keyword name may appear in different scopes with different meanings.

For example:

```yaml
BUILD:
  STEPS:

    - RUN: "gcc main.c -o app"
```

means:

```text
execute gcc while constructing the filesystem
```

while:

```yaml
RUN:
  CMD: "/app"
```

means:

```text
execute /app when the finished container starts
```

The parser must represent these as different internal constructs.

Conceptually:

```text
BUILD.RUN
    = build command

RUN.CMD
    = final container command
```

There is no semantic ambiguity after parsing because the enclosing section defines the context.

---

# 37. Build-time configuration does not become runtime configuration

A build layer may contain:

```yaml
BIND:
  - "/host/source:/source"

NETWORKS:
  - build-network

DEPENDS_ON:
  - compiler

RUN:
  - "compile"
```

None of those runtime characteristics automatically become part of the final container.

After the layer finishes:

```text
temporary build container
        │
        ▼
filesystem result
```

Only the resulting filesystem changes are carried into the next build state.

If the final container needs a bind/network/dependency, it must be declared explicitly under `RUN`.

---

# 38. Runtime configuration becomes part of the application bundle

The engine ultimately generates an application bundle containing both:

```text
filesystem/artifact
```

and:

```text
runtime specification
```

Conceptually:

```text
application bundle
│
├── root filesystem
│
├── static configuration
│
└── runtime specification
      ├── CMD
      ├── BIND
      ├── PORTS
      ├── EXPOSE
      ├── NETWORKS
      ├── DEPENDS_ON
      └── PRIORITY
```

The Go runtime consumes this final runtime specification.

The build mechanics such as:

```text
COPY
temporary BIND
build RUN
ROLLBACK
build dependencies
```

do not need to be understood by the runtime.

---

# 39. Complete example

A complete application might look like:

```yaml
NETWORKS:

  - frontend
  - backend
  - database
  - monitoring


MODES:

  BUILD: parallel
  LAUNCH: parallel


CONTAINERS:


  postgres:

    BUILD:

      STEPS:

        - FROM: alpine

        - RUN:
            - "apk update"
            - "apk add postgresql"

        - BIND:
            - "./postgres-init:/init"

          RUN:
            - "cp /init/postgres.conf /etc/postgresql/postgresql.conf"

    CONFIG:
      # Static container/artifact configuration goes here.

    RUN:

      PRIORITY: 1

      NETWORKS:
        - database

      EXPOSE:
        - 5432

      CMD: "postgres"


  redis:

    BUILD:

      STEPS:

        - FROM: alpine

        - RUN:
            - "apk update"
            - "apk add redis"

    CONFIG:

    RUN:

      PRIORITY: 1

      NETWORKS:
        - backend

      EXPOSE:
        - 6379

      CMD: "redis-server"


  backend:

    BUILD:

      STEPS:

        - FROM: alpine

        - BIND:
            - "./backend:/src"

          RUN:
            - "apk update"
            - "apk add gcc"

        - RUN:
            - "gcc /src/main.c -o /app/backend"

    CONFIG:

    RUN:

      PRIORITY: 2

      DEPENDS_ON:
        - postgres
        - redis

      NETWORKS:
        - backend
        - database

      BIND:
        - "./backend-data:/app/data"
        - "./backend-config:/app/config"

      EXPOSE:
        - 8080

      PORTS:
        - "8080:8080"

      CMD:
        - "/app/backend"
        - "--config"
        - "/app/config/app.conf"


  frontend:

    BUILD:

      STEPS:

        - FROM: alpine

        - COPY:
            - "host:./frontend"
            - "current:/app"

        - RUN:
            - "build-frontend.sh"

    CONFIG:

    RUN:

      PRIORITY: 3

      DEPENDS_ON:
        - backend

      NETWORKS:
        - frontend
        - backend

      EXPOSE:
        - 3000

      PORTS:
        - "80:3000"

      CMD: "/app/frontend"
```

This produces the following logical runtime graph:

```text
                    ┌─────────────┐
                    │   postgres  │
                    │  priority 1 │
                    └──────┬──────┘
                           │
                           │ dependency
                           ▼
                    ┌─────────────┐
                    │   backend   │
                    │  priority 2 │
                    └──────┬──────┘
                           │
                           │ dependency
                           ▼
                    ┌─────────────┐
                    │  frontend   │
                    │  priority 3 │
                    └─────────────┘
```

while the network topology is separate:

```text
frontend network
       │
       ▼
   frontend
       │
       │
       ▼
    backend
       │
       │
database network
       │
       ▼
   postgres
```

and Redis can independently participate in the backend network:

```text
backend network
   │
   ├── backend
   │
   └── redis
```

The startup dependencies and networking relationships are therefore not the same graph.

---

# 40. Canonical conceptual grammar

A simplified grammar for the language is:

```text
CONSTRUCTION_FILE
    := NETWORKS
       MODES
       CONTAINERS

NETWORKS
    := list of NETWORK_NAME

MODES
    := BUILD_MODE
       LAUNCH_MODE

BUILD_MODE
    := parallel | sequence

LAUNCH_MODE
    := parallel | sequence

CONTAINERS
    := one or more CONTAINER

CONTAINER
    := NAME
       BUILD?
       CONFIG?
       RUN?

BUILD
    := STEPS
       BUILD_SCOPE_CONFIGURATION?

STEPS
    := ordered list of LAYER

LAYER
    := FROM?
       COPY?
       RUN?
       BIND?
       UNBIND?
       NETWORKS?
       DEPENDS_ON?
       ROLLBACK?
       NESTED_STEPS?
       CLEAR

CONFIG
    := static configuration

RUNTIME
    := PRIORITY?
       DEPENDS_ON?
       NETWORKS?
       BIND?
       UNBIND?
       PORTS?
       EXPOSE?
       CMD?

NETWORKS
    := list of network names

BINDS
    := list of SOURCE:DISTINATION mappings

PORTS
    := list of HOST_PORT:CONTAINER_PORT mappings

EXPOSE
    := list of container ports

DEPENDS_ON
    := list of build/runtime dependency names
       depending on scope
```

The grammar above describes the structure conceptually; the exact YAML serialization syntax can be tightened later without changing these semantics.

---

# 41. Core semantic rules

The current language can therefore be summarized by these rules:

```text
1. A construction file can describe multiple containers.

2. BUILD constructs the filesystem/artifact.

3. RUN describes execution of the finished artifact.

4. CONFIG contains static configuration and is separate from both BUILD and RUN.

5. BUILD.STEPS is an ordered list of layers.

6. Every build layer is a temporary actual containerized environment.

7. A layer may have RUN, BIND, NETWORKS and DEPENDS_ON.

8. Build commands within a layer execute sequentially.

9. Container builds may execute concurrently when BUILD mode is parallel.

10. Build dependencies block only the dependent work.

11. BUILD DEPENDS_ON does not imply runtime DEPENDS_ON.

12. BUILD networking does not imply runtime networking.

13. BUILD bindings do not become runtime bindings.

14. RUN DEPENDS_ON controls runtime startup order.

15. Runtime DEPENDS_ON is an uptime/startup dependency.

16. NETWORKS define communication topology and are independent of DEPENDS_ON.

17. A container may belong to multiple networks.

18. A network may contain multiple containers.

19. PRIORITY defines startup stages.

20. Containers at the same eligible priority may start concurrently
    when LAUNCH mode is parallel.

21. PORTS publishes container ports to the host.

22. EXPOSE declares internal application/container ports.

23. Multiple BIND, PORTS, EXPOSE, NETWORKS and DEPENDS_ON entries are allowed.

24. Scope behaves like lexical inheritance.

25. Child build scopes inherit parent configuration.

26. A nested layer can see inherited BIND, NETWORKS and other applicable scope values.

27. Nesting is intentionally shallow and is not an arbitrary recursive tree.

28. VAR is processed by a preprocessor before normal parsing.

29. ROLLBACK is a build filesystem operation.

30. Runtime configuration is compiled into the final application bundle.
```

---

# 42. What the construction file represents

The construction file is therefore best thought of as:

```text
APPLICATION SPECIFICATION
        │
        ├── BUILD GRAPH
        │     ├── layers
        │     ├── build dependencies
        │     ├── build networks
        │     ├── build binds
        │     └── filesystem transitions
        │
        └── RUNTIME GRAPH
              ├── containers
              ├── startup dependencies
              ├── priorities
              ├── networks
              ├── port publications
              ├── runtime binds
              └── commands
```

It is not merely a Dockerfile replacement.

It is the source description from which Matryoshka produces both:

```text
the application filesystem
```

and:

```text
the application runtime topology
```

while deliberately keeping build-time behavior and runtime behavior separate.

```

This gives you a solid v0.1 language reference while leaving a few things intentionally open for the next design pass, especially the exact `CONFIG` fields, the final variable/macro syntax, and the precise syntax for naming/referencing layers.
```
