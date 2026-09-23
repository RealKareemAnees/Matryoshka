# Functional equirements

1. Container definition and configuration

It should allow the user to define a container using a declarative configuration file.
It should support application metadata such as name, version, entrypoint, command, environment, and working directory.
It should support command-line arguments for the container process.
It should support environment variables.
It should support a configurable working directory.
It should support configurable hostname.
It should support configurable user and group identity inside the container.
It should support configurable resource limits.
It should support configurable filesystem mounts.
It should support configurable networking.
It should support configurable Linux capabilities.
It should support configurable namespace isolation.
It should support configurable signal and lifecycle behavior.
It should validate configuration before attempting container creation.
It should provide clear errors for invalid configuration.

2. Image construction / engine

It should allow the user to construct a filesystem image from a base filesystem.
It should support multiple construction steps.
It should allow each construction step to operate on the filesystem produced by previous steps.
It should support installing packages into an image.
It should support copying application files into an image.
It should support creating directories and files inside an image.
It should support setting file ownership and permissions.
It should support setting environment defaults in an image.
It should support setting an image entrypoint.
It should support setting an image command.
It should support setting the default working directory.
It should support image metadata.
It should detect failed construction steps.
It should stop image construction when a required step fails.
It should provide reproducible construction results from identical inputs.
It should cache reusable construction stages.
It should allow cached stages to be reused without rebuilding them.
It should allow the user to explicitly invalidate or rebuild cached stages.
It should verify the integrity of constructed filesystem data.
It should produce a portable application bundle from the constructed image.

4. Image and bundle format

It should define a Matryoshka-specific image format.
It should define a Matryoshka-specific bundle format.
It should store the container filesystem inside the bundle.
It should store runtime metadata inside the bundle.
It should store the container configuration inside the bundle.
It should store the executable runtime components required to launch the container.
It should support a single-file self-contained bundle.
It should allow the bundle to be copied to another compatible Linux machine.
It should not require Docker image storage.
It should not require containerd.
It should not require runc.
It should not require a Docker daemon.
It should provide bundle versioning.
It should provide bundle integrity verification.
It should detect corrupted or incomplete bundles.

5. Self-contained execution

It should allow a bundle to launch directly from the command line.
It should contain all Matryoshka runtime components required for execution.
It should not depend on a separately installed Matryoshka runtime for normal execution.
It should unpack or expose the embedded filesystem before container startup.
It should execute the configured application as the container's initial process.
It should clean up temporary runtime files after execution.
It should preserve the container exit status.
It should correctly forward termination signals to the container's init process.
It should handle abnormal termination without leaving permanent runtime state.
It should support execution from an arbitrary user-writable directory.

6. Rootless execution

It should allow an ordinary Linux user to create containers without root privileges.
It should not require sudo for normal container execution.
It should use user namespaces for privilege isolation.
It should map the host user's identity into the container appropriately.
It should support UID mappings.
It should support GID mappings.
It should prevent container root from becoming host root.
It should restrict privileged operations to the container's permitted namespaces and capabilities.
It should gracefully handle kernel features unavailable to an unprivileged user.
It should detect when rootless functionality is unavailable.
It should report exactly which rootless capability failed and why.
It should operate using user-owned runtime directories.
It should avoid modifying privileged host configuration.
It should avoid requiring a privileged daemon.

7. User namespace and identity management

It should create an isolated user namespace for the container.
It should support configurable UID ranges.
It should support configurable GID ranges.
It should establish UID mappings before entering restricted operations.
It should establish GID mappings before entering restricted operations.
It should configure supplementary groups appropriately.
It should support running applications as non-root users inside the container.
It should allow container root to exist independently from host root.
It should expose container identity separately from host identity.

8. Linux namespace isolation

It should support PID namespaces.
It should support mount namespaces.
It should support network namespaces.
It should support UTS namespaces.
It should support IPC namespaces.
It should support user namespaces.
It should support namespace creation according to container configuration.
It should place the container's initial process inside the requested namespaces.
It should isolate the container process tree from the host.
It should isolate the container hostname from the host hostname.
It should isolate IPC resources from the host where configured.
It should isolate the container's network stack from the host.
It should expose namespace identifiers for inspection.
It should support entering an existing container namespace for debugging where permitted.
It should clean up namespace-related resources after container termination.

9. Filesystem isolation

It should provide every container with an isolated root filesystem.
It should prepare the container root filesystem before process startup.
It should mount required pseudo-filesystems inside the container.
It should provide /proc appropriately.
It should provide /sys appropriately where supported.
It should provide /dev appropriately.
It should isolate container filesystem modifications from the host filesystem.
It should support bind mounts.
It should support read-only mounts.
It should support writable mounts.
It should support temporary filesystem mounts.
It should support anonymous temporary storage.
It should support configurable mount propagation.
It should correctly configure mount propagation for isolation.
It should prevent unintended host mount propagation into the container.
It should prevent unintended container mount propagation into the host.
It should support pivot_root or an equivalent safe root-filesystem transition.
It should correctly detach the old root filesystem.
It should prevent escaping the intended container root filesystem.
It should clean up temporary mount points after container termination.

10. Storage

It should provide persistent container volumes.
It should provide ephemeral container storage.
It should allow volumes to be mounted into arbitrary container paths.
It should distinguish image data from writable container data.
It should allow containers to restart while preserving persistent volumes.
It should allow volumes to be removed explicitly.
It should prevent accidental deletion of referenced persistent volumes.
It should expose storage usage information.
It should support filesystem quotas where the underlying filesystem permits them.

11. Networking

It should support containers without networking.
It should support isolated network namespaces.
It should support container loopback networking.
It should support connecting a container to the host network where explicitly requested.
It should support virtual Ethernet pairs.
It should support connecting a container network namespace to the host network namespace.
It should support private container networks.
It should support assigning container IP addresses.
It should support configuring container routes.
It should support DNS configuration.
It should allow containers to communicate with the outside network.
It should allow selected containers to communicate with each other.
It should isolate unrelated containers from each other.
It should support configurable network interfaces.
It should report container network configuration.
It should clean up network interfaces created for terminated containers.

12. Capabilities and privilege control

It should provide a default restricted capability set.
It should allow capabilities to be explicitly added.
It should allow capabilities to be explicitly removed.
It should configure the container's permitted capability set.
It should configure the container's effective capability set.
It should configure the container's inheritable capability set where required.
It should handle capability changes in the correct user namespace.
It should prevent unnecessary capabilities from being inherited by the container.
It should prevent the container from acquiring host privileges through capabilities.
It should clearly report unsupported capability configurations.
It should provide a mechanism for inspecting the capabilities of a running container.

13. Security isolation

It should minimize the privileges available to container processes.
It should isolate container processes from host processes.
It should prevent unauthorized access to host filesystem paths.
It should prevent unauthorized modification of host namespaces.
It should prevent unauthorized access to host devices.
It should restrict access to Linux capabilities.
It should support read-only container root filesystems.
It should support dropping all unnecessary capabilities.
It should support no_new_privs.
It should provide secure defaults.
It should reject insecure configurations where required by an explicit security policy.
It should expose security configuration for auditing.

14. Process and lifecycle management

It should create containers with a unique container identifier.
It should create a container process hierarchy.
It should define the container's PID 1.
It should start the container.
It should stop the container gracefully.
It should forcefully terminate a container.
It should restart a container.
It should pause a container where the configured isolation mechanisms support it.
It should resume a paused container where supported.
It should wait for container termination.
It should return the application exit code.
It should propagate signals correctly.
It should reap zombie processes inside the container.
It should handle PID 1 behavior correctly.
It should detect orphaned container processes.
It should clean up resources after termination.
It should recover from partially completed container startup.
It should prevent duplicate container identifiers.
It should support configurable restart policies.

15. Resource management

It should support CPU resource limits.
It should support CPU weight/shares where available.
It should support CPU affinity where appropriate.
It should support memory limits.
It should support memory accounting.
It should support process-count limits.
It should support I/O limits where permitted.
It should support cgroups v2 where available.
It should detect whether the current user has access to the required cgroup controllers.
It should support delegated cgroup subtrees for rootless execution where available.
It should gracefully degrade when specific controllers cannot be used rootlessly.
It should expose resource usage information.
It should prevent a container from exceeding configured resource limits.

16. Container inspection

It should list existing containers.
It should show container state.
It should show container identifier.
It should show container name.
It should show creation time.
It should show startup time.
It should show exit status.
It should show the container's PID from the host perspective.
It should show the container's PID 1.
It should show configured namespaces.
It should show configured capabilities.
It should show configured resource limits.
It should show network configuration.
It should show mount configuration.
It should show storage information.
It should show runtime errors and failure states.

17. Container management CLI

It should provide a command-line interface.
It should support creating containers.
It should support starting containers.
It should support stopping containers.
It should support restarting containers.
It should support deleting containers.
It should support listing containers.
It should support inspecting containers.
It should support showing container logs.
It should support executing a command inside a running container.
It should support attaching to a container's standard input/output where appropriate.
It should support exporting a container bundle.
It should support importing a container bundle.
It should support building an image/bundle.
It should support validating a bundle.
It should provide human-readable output.
It should provide machine-readable output such as JSON.

18. Runtime command execution

It should execute commands inside an existing running container.
It should place the new process into the container's relevant namespaces.
It should apply the container's security restrictions to the new process.
It should apply the container's user identity to the new process.
It should provide correct environment inheritance.
It should support interactive commands.
It should return the executed command's exit code.

19. Logging and observability

It should capture container standard output.
It should capture container standard error.
It should provide container logs.
It should support following logs in real time.
It should support configurable log destinations.
It should support log size limits.
It should prevent unbounded log growth.
It should provide runtime diagnostic logs.
It should distinguish engine errors from container-process errors.
It should provide sufficient information for debugging startup failures.
It should optionally expose runtime events.

20. Runtime state management

It should maintain container metadata independently of the container filesystem.
It should store runtime state in a user-owned state directory.
It should recover metadata after the runtime process exits unexpectedly.
It should detect stale runtime state.
It should detect containers whose processes no longer exist.
It should safely clean stale state.
It should avoid corrupting state after interrupted operations.
It should make state transitions explicit, such as created → running → stopped.

21. Process supervision

It should supervise the container's initial process.
It should detect unexpected process termination.
It should reap terminated child processes.
It should forward relevant signals.
It should avoid becoming a permanent privileged daemon.
It should handle runtime crashes without unnecessarily killing unrelated containers.
It should prevent resource leaks when supervision fails.

22. Portability and compatibility

It should target Linux.
It should document the minimum supported Linux kernel version.
It should detect required kernel features at runtime.
It should detect unsupported namespace features.
It should detect unsupported cgroup features.
It should detect unsupported filesystem behavior.
It should work across supported Linux distributions.
It should handle differences between filesystem implementations.
It should provide meaningful compatibility errors instead of silently disabling isolation.

23. Bundle portability

It should allow a generated bundle to run on another compatible Linux host.
It should include sufficient metadata to determine compatibility requirements.
It should avoid host-specific absolute paths wherever possible.
It should avoid requiring the same image-building environment on the target machine.
It should verify architecture compatibility.
It should detect incompatible CPU architecture.
It should support multiple architectures in the future.

24. Dependency management

It should minimize runtime dependencies on the host.
It should identify unavoidable kernel dependencies explicitly.
It should not depend on Docker for execution.
It should not depend on containerd for execution.
It should not depend on runc for execution.
It should not require a Matryoshka server daemon.
It should bundle its own userspace runtime components where practical.
It should clearly distinguish host-kernel dependencies from bundled dependencies.

25. Error handling

It should validate all user-supplied configuration.
It should validate bundle integrity before execution.
It should detect permission failures.
It should detect namespace creation failures.
It should detect mount failures.
It should detect UID/GID mapping failures.
It should detect capability configuration failures.
It should detect cgroup failures.
It should detect networking setup failures.
It should clean up resources after failed startup.
It should return meaningful error codes.
It should provide actionable error messages.

26. Security of the engine itself

It should treat container configuration as untrusted input.
It should validate filesystem paths.
It should prevent path traversal during extraction.
It should prevent archive extraction from writing outside the intended destination.
It should validate bundle metadata before execution.
It should avoid unsafe temporary-file handling.
It should avoid TOCTOU vulnerabilities where relevant.
It should carefully control file descriptor inheritance.
It should close unnecessary file descriptors before executing the container.
It should sanitize the execution environment where necessary.
It should avoid executing host binaries unintentionally.
It should clearly separate trusted engine code from container content.

27. Bundle integrity and trust

It should generate checksums for bundles.
It should verify checksums before execution.
It should detect modified bundle contents.
It should optionally support digital signatures.
It should optionally verify bundle signatures against trusted keys.
It should expose bundle provenance metadata.
It should record the image/build source where applicable.

28. Developer experience

It should have predictable command semantics.
It should provide --help documentation.
It should provide clear examples.
It should provide verbose/debug mode.
It should make low-level runtime failures understandable to developers.
It should provide diagnostics for common rootless failures.
It should make container lifecycle operations easy to script.
It should provide stable machine-readable output.
It should have deterministic configuration parsing.
It should avoid unnecessary Docker-compatible complexity in the first version.

30. API / engine architecture

It should separate image construction from container execution.
It should separate the high-level engine from the low-level runtime.
It should expose an internal runtime API.
It should expose an engine API for creating and managing containers.
It should separate bundle generation from bundle execution.
It should isolate platform-specific Linux code behind well-defined interfaces.
It should make namespace operations independently testable.
It should make mount operations independently testable.
It should make capability operations independently testable.
It should make networking operations independently testable.
It should make cgroup operations independently testable.
It should make lifecycle management independently testable.

31. Runtime extensibility

It should allow additional isolation mechanisms to be added later.
It should allow additional storage backends to be added later.
It should allow additional networking implementations to be added later.
It should allow different bundle formats to be supported later.
It should allow architecture-specific launchers to be added later.
It should allow future sandboxing technologies to be integrated without redesigning the engine.

32. Performance

It should start containers with low startup latency.
It should minimize unnecessary filesystem copying.
It should avoid unnecessary image reconstruction.
It should reuse cached construction stages.
It should minimize memory overhead of the runtime.
It should minimize CPU overhead of container supervision.
It should avoid unnecessary background processes.
It should efficiently clean up terminated containers.
It should scale to multiple simultaneously running containers within host resource limits.

33. Reliability

It should maintain correct container state across normal shutdowns.
It should survive interrupted image builds without corrupting previous builds.
It should survive interrupted container startup without leaking mounts or processes.
It should clean up resources after crashes.
It should detect inconsistent runtime state.
It should avoid leaving orphaned network interfaces.
It should avoid leaving orphaned mounts.
It should avoid leaving orphaned processes.
It should avoid leaving stale cgroups where possible.
It should produce deterministic results for identical inputs.

34. Testing requirements

It should have unit tests for configuration parsing.
It should have unit tests for bundle parsing.
It should have tests for UID/GID mapping.
It should have tests for namespace creation.
It should have tests for mount isolation.
It should have tests for mount propagation.
It should have tests for capability handling.
It should have tests for cgroup configuration.
It should have tests for network setup.
It should have tests for lifecycle transitions.
It should have tests for cleanup after failure.
It should have integration tests that launch real containers.
It should have rootless integration tests.
It should have security regression tests.
It should have bundle portability tests.
It should have tests for malformed and malicious bundles.

35. Documentation

It should document the architecture.
It should document the engine/runtime boundary.
It should document the bundle format.
It should document the container lifecycle.
It should document namespace isolation.
It should document mount isolation.
It should document capability management.
It should document rootless execution.
It should document cgroups.
It should document networking.
It should document security assumptions.
It should document kernel requirements.
It should document known limitations.
It should provide a troubleshooting guide.
It should provide examples for common workloads.

36. Non-functional requirements

It should be secure by default.
It should operate without root privileges for its supported rootless feature set.
It should have predictable behavior across supported Linux systems.
It should have deterministic builds.
It should have reproducible bundle generation.
It should have stable CLI behavior.
It should provide meaningful observability.
It should fail safely when an isolation mechanism cannot be established.
It should never silently claim isolation that it failed to establish.
It should minimize host-side dependencies.
It should minimize attack surface.
It should minimize runtime overhead.
It should be maintainable and modular.
It should be extensible without requiring a complete rewrite.
It should have automated test coverage for security-sensitive code.
It should provide backward compatibility for supported bundle versions.
It should provide deterministic error behavior where practical.
It should avoid unnecessary abstraction in low-level security-critical paths.
It should make security-critical operations auditable.
It should document every operation that requires a kernel capability, delegated resource, or privileged host configuration.