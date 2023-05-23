# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 6.5.0-alpha.14 (2023-05-23)


### Bug Fixes

* Custom Resource Definitions should be the first entry in the side bar ([a8ff6ce](https://github.com/lensapp/lens/commit/a8ff6ce0954dadf17d2617ad3d84c09b1173766e))
* Custom Resource Definitions sidebar item should navigate to the correct route ([897e289](https://github.com/lensapp/lens/commit/897e289514b6c02831bf16bf691f31920a40f841))
* Fix formatting of custom resource sidebar items ([86dcbb1](https://github.com/lensapp/lens/commit/86dcbb10c000aac225d6511812e0eeecdc9c2b5d))
* The command pallet command for navigating to Custom Resource Definitions should navigate to the correct route ([723cfe8](https://github.com/lensapp/lens/commit/723cfe8ae8fed5c3fdfc98961ec0ab315cefe972))
* Use correct path for node-shell shell PTY ([99e6b77](https://github.com/lensapp/lens/commit/99e6b77fc1c5a74cfef90981b8b0162b46ecfb43))



# 6.5.0-alpha.13 (2023-05-16)


### Bug Fixes

* Switch to using IAsyncComputed to resolve bad setState error within ClusterOverview from react ([4f8e470](https://github.com/lensapp/lens/commit/4f8e4707f929eee04ff1345c9e93f00d50ac0a92))



# 6.5.0-alpha.12 (2023-05-16)


### Bug Fixes

* Don't crash when hovering hotbar menu index ([9d51ef2](https://github.com/lensapp/lens/commit/9d51ef2aa69c6c9df0fd57281b25131a10efd27a))



# 6.5.0-alpha.11 (2023-05-11)


### Bug Fixes

* Add test as repro, and fix bug about kube API details not opening ([bb400ae](https://github.com/lensapp/lens/commit/bb400ae66797fe160567e6b728d85d5e79caef4d))
* Bring back search filters for pods which were accidentally removed previously ([9c7be39](https://github.com/lensapp/lens/commit/9c7be39eb135b747945f76f61811695d2f96c761))
* Do not crash when opening details of a helm release ([40af0d3](https://github.com/lensapp/lens/commit/40af0d31c529e252a45c7370852755c4e63067a7))
* Kludge cluster settings not opening when extension introduces new settings without ID when title contains spaces ([e8491ca](https://github.com/lensapp/lens/commit/e8491ca2d39971d06842f6741eae042554fbc9a0))



# 6.5.0-alpha.10 (2023-05-09)



# 6.5.0-alpha.9 (2023-05-04)


### Bug Fixes

* Add checks to KubeObject constructor to ensure shape ([bf6af58](https://github.com/lensapp/lens/commit/bf6af58d80552a16be7a547f772902b138a12fbd))
* add routingFeature to getDiForUnitTesting ([b33a8b4](https://github.com/lensapp/lens/commit/b33a8b49607935450f70b1d5535431ba416fc22e))
* change class name behaviour to limit snapshot diffs ([bfb2b8e](https://github.com/lensapp/lens/commit/bfb2b8e6591891b529d5cf0f8757ff8b7080e004))
* **core:** hide update button if downloading of an update fails ([f697742](https://github.com/lensapp/lens/commit/f6977428daa3f61482e7066689ebf7092b0fb2b1))
* Fix selfLink being missing from requestKubeResource ([b90e04e](https://github.com/lensapp/lens/commit/b90e04e02dfd18896d5f08f1bc36f90179635797))
* lint:fix ([76c11aa](https://github.com/lensapp/lens/commit/76c11aa697e3ada81c876fe8a3ac6e33b4ce8cb9))
* observableHistoryInjectionToken and 1 revert for GlobalOverride ([8c0220c](https://github.com/lensapp/lens/commit/8c0220c353c9047a2a4df570b598c31868b5f7e2))
* Only show Update Channel preferences when applicable ([43cedae](https://github.com/lensapp/lens/commit/43cedae7b05eaa7f932f2718939f7b856a1b86c5))
* Remove incorrect timeout on standard info notifications ([bcf95a6](https://github.com/lensapp/lens/commit/bcf95a65f1d2be91fa613f0da9d0ae978faaef75))
* removed as-legacy-globals-for-extension-api ([f1f2634](https://github.com/lensapp/lens/commit/f1f26344900b99c70b2bed2f453ed27574d7b417))
* removed dependencies: [reactApplicationFeature], ([0dae159](https://github.com/lensapp/lens/commit/0dae1594baabbd06e798f9a1b4c132cee998bb65))


### Features

* Add deleting subNamespaces to contextMenu ([89cf491](https://github.com/lensapp/lens/commit/89cf491bc0aa80ee398f8b5dc39ec7c69d00c7bb))
* Add removing subNamespaces to Namespace route ([aa95002](https://github.com/lensapp/lens/commit/aa950026a3162abf6322afb4b5c5bf56f9f7e10f))
* Adjust container status colors to be distinguable with red/green filter ([#7621](https://github.com/lensapp/lens/issues/7621)) ([3532fc1](https://github.com/lensapp/lens/commit/3532fc1dab918190fa76199a9d7b04d6efe40c47))
* Compute the kubectl download version map at build time ([0bd7b1f](https://github.com/lensapp/lens/commit/0bd7b1fe92a173379c8a5a1ab7e13cf9e4f8223b))
* Improve formatting error messages from apiKube ([3439472](https://github.com/lensapp/lens/commit/3439472065e6b850e286f6a34bccc23b827b8e28))
* Introduce API for changing the status bar colour ([06a0dce](https://github.com/lensapp/lens/commit/06a0dce612b67084f8f36ba552ea23f8ac071201))
* Introduce injectables to remove subNamespaces ([c557225](https://github.com/lensapp/lens/commit/c5572257bd6a32a2f05fc78f54ece428f54389fe))
* Never auto-close error notifications ([561d8db](https://github.com/lensapp/lens/commit/561d8dbc09581ff21aa79e85f3903c45e99ac33b))



# 6.5.0-alpha.6 (2023-04-12)



# 6.5.0-alpha.5 (2023-04-12)



# 6.5.0-alpha.4 (2023-04-12)


### Bug Fixes

* Fix tests by recreating non-specific injection token ([c0ebe60](https://github.com/lensapp/lens/commit/c0ebe605c4d36c0d98454e25565818f75ffb1b69))
* Referencing apiManager should not throw ([#7468](https://github.com/lensapp/lens/issues/7468)) ([351f9d4](https://github.com/lensapp/lens/commit/351f9d492f6e52e9e97d17d71e2bbdbbde4ea2db))
* remove platform specific injectable file names ([9b0318b](https://github.com/lensapp/lens/commit/9b0318b493fe2e49a34b8a4cb3d0bef1600759b8))


### Features

* Allow built versions to specify an environment ([#7495](https://github.com/lensapp/lens/issues/7495)) ([128b05d](https://github.com/lensapp/lens/commit/128b05d4d46344a511398f654865c133c6e36514))


### Reverts

* Revert "Renderer file logging through IPC" (#7393) ([5409324](https://github.com/lensapp/lens/commit/54093242367717292312df01905d052b66017953)), closes [#7393](https://github.com/lensapp/lens/issues/7393)



# 6.5.0-alpha.3 (2023-03-15)



# 6.5.0-alpha.2 (2023-03-14)



# 6.5.0-alpha.1 (2023-03-14)


### Reverts

* Revert "Renderer file logging transport (#6795)" (#7245) ([ec81af4](https://github.com/lensapp/lens/commit/ec81af4e6c5f8d0c25469a56dfa602894f85734b)), closes [#6795](https://github.com/lensapp/lens/issues/6795) [#7245](https://github.com/lensapp/lens/issues/7245) [#544](https://github.com/lensapp/lens/issues/544)



# 6.4.0-beta.13 (2023-02-03)



# 6.4.0-beta.12 (2023-02-01)



# 6.4.0-beta.11 (2023-02-01)



# 6.4.0-beta.10 (2023-01-27)



# 6.4.0-beta.9 (2023-01-27)



# 6.4.0-beta.8 (2023-01-27)



# 6.4.0-beta.7 (2023-01-27)



# 6.4.0-beta.6 (2023-01-26)



# 6.4.0-beta.5 (2023-01-26)



# 6.4.0-beta.4 (2023-01-26)



# 6.4.0-beta.3 (2023-01-26)





# 6.5.0-alpha.13 (2023-05-16)


### Bug Fixes

* Switch to using IAsyncComputed to resolve bad setState error within ClusterOverview from react ([4f8e470](https://github.com/lensapp/lens/commit/4f8e4707f929eee04ff1345c9e93f00d50ac0a92))



# 6.5.0-alpha.12 (2023-05-16)


### Bug Fixes

* Don't crash when hovering hotbar menu index ([9d51ef2](https://github.com/lensapp/lens/commit/9d51ef2aa69c6c9df0fd57281b25131a10efd27a))



# 6.5.0-alpha.11 (2023-05-11)


### Bug Fixes

* Add test as repro, and fix bug about kube API details not opening ([bb400ae](https://github.com/lensapp/lens/commit/bb400ae66797fe160567e6b728d85d5e79caef4d))
* Bring back search filters for pods which were accidentally removed previously ([9c7be39](https://github.com/lensapp/lens/commit/9c7be39eb135b747945f76f61811695d2f96c761))
* Do not crash when opening details of a helm release ([40af0d3](https://github.com/lensapp/lens/commit/40af0d31c529e252a45c7370852755c4e63067a7))
* Kludge cluster settings not opening when extension introduces new settings without ID when title contains spaces ([e8491ca](https://github.com/lensapp/lens/commit/e8491ca2d39971d06842f6741eae042554fbc9a0))



# 6.5.0-alpha.10 (2023-05-09)



# 6.5.0-alpha.9 (2023-05-04)


### Bug Fixes

* Add checks to KubeObject constructor to ensure shape ([bf6af58](https://github.com/lensapp/lens/commit/bf6af58d80552a16be7a547f772902b138a12fbd))
* add routingFeature to getDiForUnitTesting ([b33a8b4](https://github.com/lensapp/lens/commit/b33a8b49607935450f70b1d5535431ba416fc22e))
* change class name behaviour to limit snapshot diffs ([bfb2b8e](https://github.com/lensapp/lens/commit/bfb2b8e6591891b529d5cf0f8757ff8b7080e004))
* **core:** hide update button if downloading of an update fails ([f697742](https://github.com/lensapp/lens/commit/f6977428daa3f61482e7066689ebf7092b0fb2b1))
* Fix selfLink being missing from requestKubeResource ([b90e04e](https://github.com/lensapp/lens/commit/b90e04e02dfd18896d5f08f1bc36f90179635797))
* lint:fix ([76c11aa](https://github.com/lensapp/lens/commit/76c11aa697e3ada81c876fe8a3ac6e33b4ce8cb9))
* observableHistoryInjectionToken and 1 revert for GlobalOverride ([8c0220c](https://github.com/lensapp/lens/commit/8c0220c353c9047a2a4df570b598c31868b5f7e2))
* Only show Update Channel preferences when applicable ([43cedae](https://github.com/lensapp/lens/commit/43cedae7b05eaa7f932f2718939f7b856a1b86c5))
* Remove incorrect timeout on standard info notifications ([bcf95a6](https://github.com/lensapp/lens/commit/bcf95a65f1d2be91fa613f0da9d0ae978faaef75))
* removed as-legacy-globals-for-extension-api ([f1f2634](https://github.com/lensapp/lens/commit/f1f26344900b99c70b2bed2f453ed27574d7b417))
* removed dependencies: [reactApplicationFeature], ([0dae159](https://github.com/lensapp/lens/commit/0dae1594baabbd06e798f9a1b4c132cee998bb65))


### Features

* Add deleting subNamespaces to contextMenu ([89cf491](https://github.com/lensapp/lens/commit/89cf491bc0aa80ee398f8b5dc39ec7c69d00c7bb))
* Add removing subNamespaces to Namespace route ([aa95002](https://github.com/lensapp/lens/commit/aa950026a3162abf6322afb4b5c5bf56f9f7e10f))
* Adjust container status colors to be distinguable with red/green filter ([#7621](https://github.com/lensapp/lens/issues/7621)) ([3532fc1](https://github.com/lensapp/lens/commit/3532fc1dab918190fa76199a9d7b04d6efe40c47))
* Compute the kubectl download version map at build time ([0bd7b1f](https://github.com/lensapp/lens/commit/0bd7b1fe92a173379c8a5a1ab7e13cf9e4f8223b))
* Improve formatting error messages from apiKube ([3439472](https://github.com/lensapp/lens/commit/3439472065e6b850e286f6a34bccc23b827b8e28))
* Introduce API for changing the status bar colour ([06a0dce](https://github.com/lensapp/lens/commit/06a0dce612b67084f8f36ba552ea23f8ac071201))
* Introduce injectables to remove subNamespaces ([c557225](https://github.com/lensapp/lens/commit/c5572257bd6a32a2f05fc78f54ece428f54389fe))
* Never auto-close error notifications ([561d8db](https://github.com/lensapp/lens/commit/561d8dbc09581ff21aa79e85f3903c45e99ac33b))



# 6.5.0-alpha.6 (2023-04-12)



# 6.5.0-alpha.5 (2023-04-12)



# 6.5.0-alpha.4 (2023-04-12)


### Bug Fixes

* Fix tests by recreating non-specific injection token ([c0ebe60](https://github.com/lensapp/lens/commit/c0ebe605c4d36c0d98454e25565818f75ffb1b69))
* Referencing apiManager should not throw ([#7468](https://github.com/lensapp/lens/issues/7468)) ([351f9d4](https://github.com/lensapp/lens/commit/351f9d492f6e52e9e97d17d71e2bbdbbde4ea2db))
* remove platform specific injectable file names ([9b0318b](https://github.com/lensapp/lens/commit/9b0318b493fe2e49a34b8a4cb3d0bef1600759b8))


### Features

* Allow built versions to specify an environment ([#7495](https://github.com/lensapp/lens/issues/7495)) ([128b05d](https://github.com/lensapp/lens/commit/128b05d4d46344a511398f654865c133c6e36514))


### Reverts

* Revert "Renderer file logging through IPC" (#7393) ([5409324](https://github.com/lensapp/lens/commit/54093242367717292312df01905d052b66017953)), closes [#7393](https://github.com/lensapp/lens/issues/7393)



# 6.5.0-alpha.3 (2023-03-15)



# 6.5.0-alpha.2 (2023-03-14)



# 6.5.0-alpha.1 (2023-03-14)


### Reverts

* Revert "Renderer file logging transport (#6795)" (#7245) ([ec81af4](https://github.com/lensapp/lens/commit/ec81af4e6c5f8d0c25469a56dfa602894f85734b)), closes [#6795](https://github.com/lensapp/lens/issues/6795) [#7245](https://github.com/lensapp/lens/issues/7245) [#544](https://github.com/lensapp/lens/issues/544)



# 6.4.0-beta.13 (2023-02-03)



# 6.4.0-beta.12 (2023-02-01)



# 6.4.0-beta.11 (2023-02-01)



# 6.4.0-beta.10 (2023-01-27)



# 6.4.0-beta.9 (2023-01-27)



# 6.4.0-beta.8 (2023-01-27)



# 6.4.0-beta.7 (2023-01-27)



# 6.4.0-beta.6 (2023-01-26)



# 6.4.0-beta.5 (2023-01-26)



# 6.4.0-beta.4 (2023-01-26)



# 6.4.0-beta.3 (2023-01-26)





# 6.5.0-alpha.12 (2023-05-16)


### Bug Fixes

* Don't crash when hovering hotbar menu index ([9d51ef2](https://github.com/lensapp/lens/commit/9d51ef2aa69c6c9df0fd57281b25131a10efd27a))



# 6.5.0-alpha.11 (2023-05-11)


### Bug Fixes

* Add test as repro, and fix bug about kube API details not opening ([bb400ae](https://github.com/lensapp/lens/commit/bb400ae66797fe160567e6b728d85d5e79caef4d))
* Bring back search filters for pods which were accidentally removed previously ([9c7be39](https://github.com/lensapp/lens/commit/9c7be39eb135b747945f76f61811695d2f96c761))
* Do not crash when opening details of a helm release ([40af0d3](https://github.com/lensapp/lens/commit/40af0d31c529e252a45c7370852755c4e63067a7))
* Kludge cluster settings not opening when extension introduces new settings without ID when title contains spaces ([e8491ca](https://github.com/lensapp/lens/commit/e8491ca2d39971d06842f6741eae042554fbc9a0))



# 6.5.0-alpha.10 (2023-05-09)



# 6.5.0-alpha.9 (2023-05-04)


### Bug Fixes

* Add checks to KubeObject constructor to ensure shape ([bf6af58](https://github.com/lensapp/lens/commit/bf6af58d80552a16be7a547f772902b138a12fbd))
* add routingFeature to getDiForUnitTesting ([b33a8b4](https://github.com/lensapp/lens/commit/b33a8b49607935450f70b1d5535431ba416fc22e))
* change class name behaviour to limit snapshot diffs ([bfb2b8e](https://github.com/lensapp/lens/commit/bfb2b8e6591891b529d5cf0f8757ff8b7080e004))
* **core:** hide update button if downloading of an update fails ([f697742](https://github.com/lensapp/lens/commit/f6977428daa3f61482e7066689ebf7092b0fb2b1))
* Fix selfLink being missing from requestKubeResource ([b90e04e](https://github.com/lensapp/lens/commit/b90e04e02dfd18896d5f08f1bc36f90179635797))
* lint:fix ([76c11aa](https://github.com/lensapp/lens/commit/76c11aa697e3ada81c876fe8a3ac6e33b4ce8cb9))
* observableHistoryInjectionToken and 1 revert for GlobalOverride ([8c0220c](https://github.com/lensapp/lens/commit/8c0220c353c9047a2a4df570b598c31868b5f7e2))
* Only show Update Channel preferences when applicable ([43cedae](https://github.com/lensapp/lens/commit/43cedae7b05eaa7f932f2718939f7b856a1b86c5))
* Remove incorrect timeout on standard info notifications ([bcf95a6](https://github.com/lensapp/lens/commit/bcf95a65f1d2be91fa613f0da9d0ae978faaef75))
* removed as-legacy-globals-for-extension-api ([f1f2634](https://github.com/lensapp/lens/commit/f1f26344900b99c70b2bed2f453ed27574d7b417))
* removed dependencies: [reactApplicationFeature], ([0dae159](https://github.com/lensapp/lens/commit/0dae1594baabbd06e798f9a1b4c132cee998bb65))


### Features

* Add deleting subNamespaces to contextMenu ([89cf491](https://github.com/lensapp/lens/commit/89cf491bc0aa80ee398f8b5dc39ec7c69d00c7bb))
* Add removing subNamespaces to Namespace route ([aa95002](https://github.com/lensapp/lens/commit/aa950026a3162abf6322afb4b5c5bf56f9f7e10f))
* Adjust container status colors to be distinguable with red/green filter ([#7621](https://github.com/lensapp/lens/issues/7621)) ([3532fc1](https://github.com/lensapp/lens/commit/3532fc1dab918190fa76199a9d7b04d6efe40c47))
* Compute the kubectl download version map at build time ([0bd7b1f](https://github.com/lensapp/lens/commit/0bd7b1fe92a173379c8a5a1ab7e13cf9e4f8223b))
* Improve formatting error messages from apiKube ([3439472](https://github.com/lensapp/lens/commit/3439472065e6b850e286f6a34bccc23b827b8e28))
* Introduce API for changing the status bar colour ([06a0dce](https://github.com/lensapp/lens/commit/06a0dce612b67084f8f36ba552ea23f8ac071201))
* Introduce injectables to remove subNamespaces ([c557225](https://github.com/lensapp/lens/commit/c5572257bd6a32a2f05fc78f54ece428f54389fe))
* Never auto-close error notifications ([561d8db](https://github.com/lensapp/lens/commit/561d8dbc09581ff21aa79e85f3903c45e99ac33b))



# 6.5.0-alpha.6 (2023-04-12)



# 6.5.0-alpha.5 (2023-04-12)



# 6.5.0-alpha.4 (2023-04-12)


### Bug Fixes

* Fix tests by recreating non-specific injection token ([c0ebe60](https://github.com/lensapp/lens/commit/c0ebe605c4d36c0d98454e25565818f75ffb1b69))
* Referencing apiManager should not throw ([#7468](https://github.com/lensapp/lens/issues/7468)) ([351f9d4](https://github.com/lensapp/lens/commit/351f9d492f6e52e9e97d17d71e2bbdbbde4ea2db))
* remove platform specific injectable file names ([9b0318b](https://github.com/lensapp/lens/commit/9b0318b493fe2e49a34b8a4cb3d0bef1600759b8))


### Features

* Allow built versions to specify an environment ([#7495](https://github.com/lensapp/lens/issues/7495)) ([128b05d](https://github.com/lensapp/lens/commit/128b05d4d46344a511398f654865c133c6e36514))


### Reverts

* Revert "Renderer file logging through IPC" (#7393) ([5409324](https://github.com/lensapp/lens/commit/54093242367717292312df01905d052b66017953)), closes [#7393](https://github.com/lensapp/lens/issues/7393)



# 6.5.0-alpha.3 (2023-03-15)



# 6.5.0-alpha.2 (2023-03-14)



# 6.5.0-alpha.1 (2023-03-14)


### Reverts

* Revert "Renderer file logging transport (#6795)" (#7245) ([ec81af4](https://github.com/lensapp/lens/commit/ec81af4e6c5f8d0c25469a56dfa602894f85734b)), closes [#6795](https://github.com/lensapp/lens/issues/6795) [#7245](https://github.com/lensapp/lens/issues/7245) [#544](https://github.com/lensapp/lens/issues/544)



# 6.4.0-beta.13 (2023-02-03)



# 6.4.0-beta.12 (2023-02-01)



# 6.4.0-beta.11 (2023-02-01)



# 6.4.0-beta.10 (2023-01-27)



# 6.4.0-beta.9 (2023-01-27)



# 6.4.0-beta.8 (2023-01-27)



# 6.4.0-beta.7 (2023-01-27)



# 6.4.0-beta.6 (2023-01-26)



# 6.4.0-beta.5 (2023-01-26)



# 6.4.0-beta.4 (2023-01-26)



# 6.4.0-beta.3 (2023-01-26)





# 6.5.0-alpha.11 (2023-05-11)


### Bug Fixes

* Add test as repro, and fix bug about kube API details not opening ([bb400ae](https://github.com/lensapp/lens/commit/bb400ae66797fe160567e6b728d85d5e79caef4d))
* Bring back search filters for pods which were accidentally removed previously ([9c7be39](https://github.com/lensapp/lens/commit/9c7be39eb135b747945f76f61811695d2f96c761))
* Do not crash when opening details of a helm release ([40af0d3](https://github.com/lensapp/lens/commit/40af0d31c529e252a45c7370852755c4e63067a7))
* Kludge cluster settings not opening when extension introduces new settings without ID when title contains spaces ([e8491ca](https://github.com/lensapp/lens/commit/e8491ca2d39971d06842f6741eae042554fbc9a0))



# 6.5.0-alpha.10 (2023-05-09)



# 6.5.0-alpha.9 (2023-05-04)


### Bug Fixes

* Add checks to KubeObject constructor to ensure shape ([bf6af58](https://github.com/lensapp/lens/commit/bf6af58d80552a16be7a547f772902b138a12fbd))
* add routingFeature to getDiForUnitTesting ([b33a8b4](https://github.com/lensapp/lens/commit/b33a8b49607935450f70b1d5535431ba416fc22e))
* change class name behaviour to limit snapshot diffs ([bfb2b8e](https://github.com/lensapp/lens/commit/bfb2b8e6591891b529d5cf0f8757ff8b7080e004))
* **core:** hide update button if downloading of an update fails ([f697742](https://github.com/lensapp/lens/commit/f6977428daa3f61482e7066689ebf7092b0fb2b1))
* Fix selfLink being missing from requestKubeResource ([b90e04e](https://github.com/lensapp/lens/commit/b90e04e02dfd18896d5f08f1bc36f90179635797))
* lint:fix ([76c11aa](https://github.com/lensapp/lens/commit/76c11aa697e3ada81c876fe8a3ac6e33b4ce8cb9))
* observableHistoryInjectionToken and 1 revert for GlobalOverride ([8c0220c](https://github.com/lensapp/lens/commit/8c0220c353c9047a2a4df570b598c31868b5f7e2))
* Only show Update Channel preferences when applicable ([43cedae](https://github.com/lensapp/lens/commit/43cedae7b05eaa7f932f2718939f7b856a1b86c5))
* Remove incorrect timeout on standard info notifications ([bcf95a6](https://github.com/lensapp/lens/commit/bcf95a65f1d2be91fa613f0da9d0ae978faaef75))
* removed as-legacy-globals-for-extension-api ([f1f2634](https://github.com/lensapp/lens/commit/f1f26344900b99c70b2bed2f453ed27574d7b417))
* removed dependencies: [reactApplicationFeature], ([0dae159](https://github.com/lensapp/lens/commit/0dae1594baabbd06e798f9a1b4c132cee998bb65))


### Features

* Add deleting subNamespaces to contextMenu ([89cf491](https://github.com/lensapp/lens/commit/89cf491bc0aa80ee398f8b5dc39ec7c69d00c7bb))
* Add removing subNamespaces to Namespace route ([aa95002](https://github.com/lensapp/lens/commit/aa950026a3162abf6322afb4b5c5bf56f9f7e10f))
* Adjust container status colors to be distinguable with red/green filter ([#7621](https://github.com/lensapp/lens/issues/7621)) ([3532fc1](https://github.com/lensapp/lens/commit/3532fc1dab918190fa76199a9d7b04d6efe40c47))
* Compute the kubectl download version map at build time ([0bd7b1f](https://github.com/lensapp/lens/commit/0bd7b1fe92a173379c8a5a1ab7e13cf9e4f8223b))
* Improve formatting error messages from apiKube ([3439472](https://github.com/lensapp/lens/commit/3439472065e6b850e286f6a34bccc23b827b8e28))
* Introduce API for changing the status bar colour ([06a0dce](https://github.com/lensapp/lens/commit/06a0dce612b67084f8f36ba552ea23f8ac071201))
* Introduce injectables to remove subNamespaces ([c557225](https://github.com/lensapp/lens/commit/c5572257bd6a32a2f05fc78f54ece428f54389fe))
* Never auto-close error notifications ([561d8db](https://github.com/lensapp/lens/commit/561d8dbc09581ff21aa79e85f3903c45e99ac33b))



# 6.5.0-alpha.6 (2023-04-12)



# 6.5.0-alpha.5 (2023-04-12)



# 6.5.0-alpha.4 (2023-04-12)


### Bug Fixes

* Fix tests by recreating non-specific injection token ([c0ebe60](https://github.com/lensapp/lens/commit/c0ebe605c4d36c0d98454e25565818f75ffb1b69))
* Referencing apiManager should not throw ([#7468](https://github.com/lensapp/lens/issues/7468)) ([351f9d4](https://github.com/lensapp/lens/commit/351f9d492f6e52e9e97d17d71e2bbdbbde4ea2db))
* remove platform specific injectable file names ([9b0318b](https://github.com/lensapp/lens/commit/9b0318b493fe2e49a34b8a4cb3d0bef1600759b8))


### Features

* Allow built versions to specify an environment ([#7495](https://github.com/lensapp/lens/issues/7495)) ([128b05d](https://github.com/lensapp/lens/commit/128b05d4d46344a511398f654865c133c6e36514))


### Reverts

* Revert "Renderer file logging through IPC" (#7393) ([5409324](https://github.com/lensapp/lens/commit/54093242367717292312df01905d052b66017953)), closes [#7393](https://github.com/lensapp/lens/issues/7393)



# 6.5.0-alpha.3 (2023-03-15)



# 6.5.0-alpha.2 (2023-03-14)



# 6.5.0-alpha.1 (2023-03-14)


### Reverts

* Revert "Renderer file logging transport (#6795)" (#7245) ([ec81af4](https://github.com/lensapp/lens/commit/ec81af4e6c5f8d0c25469a56dfa602894f85734b)), closes [#6795](https://github.com/lensapp/lens/issues/6795) [#7245](https://github.com/lensapp/lens/issues/7245) [#544](https://github.com/lensapp/lens/issues/544)



# 6.4.0-beta.13 (2023-02-03)



# 6.4.0-beta.12 (2023-02-01)



# 6.4.0-beta.11 (2023-02-01)



# 6.4.0-beta.10 (2023-01-27)



# 6.4.0-beta.9 (2023-01-27)



# 6.4.0-beta.8 (2023-01-27)



# 6.4.0-beta.7 (2023-01-27)



# 6.4.0-beta.6 (2023-01-26)



# 6.4.0-beta.5 (2023-01-26)



# 6.4.0-beta.4 (2023-01-26)



# 6.4.0-beta.3 (2023-01-26)





# 6.5.0-alpha.10 (2023-05-09)



# 6.5.0-alpha.9 (2023-05-04)


### Bug Fixes

* Add checks to KubeObject constructor to ensure shape ([bf6af58](https://github.com/lensapp/lens/commit/bf6af58d80552a16be7a547f772902b138a12fbd))
* add routingFeature to getDiForUnitTesting ([b33a8b4](https://github.com/lensapp/lens/commit/b33a8b49607935450f70b1d5535431ba416fc22e))
* change class name behaviour to limit snapshot diffs ([bfb2b8e](https://github.com/lensapp/lens/commit/bfb2b8e6591891b529d5cf0f8757ff8b7080e004))
* **core:** hide update button if downloading of an update fails ([f697742](https://github.com/lensapp/lens/commit/f6977428daa3f61482e7066689ebf7092b0fb2b1))
* Fix selfLink being missing from requestKubeResource ([b90e04e](https://github.com/lensapp/lens/commit/b90e04e02dfd18896d5f08f1bc36f90179635797))
* lint:fix ([76c11aa](https://github.com/lensapp/lens/commit/76c11aa697e3ada81c876fe8a3ac6e33b4ce8cb9))
* observableHistoryInjectionToken and 1 revert for GlobalOverride ([8c0220c](https://github.com/lensapp/lens/commit/8c0220c353c9047a2a4df570b598c31868b5f7e2))
* Only show Update Channel preferences when applicable ([43cedae](https://github.com/lensapp/lens/commit/43cedae7b05eaa7f932f2718939f7b856a1b86c5))
* Remove incorrect timeout on standard info notifications ([bcf95a6](https://github.com/lensapp/lens/commit/bcf95a65f1d2be91fa613f0da9d0ae978faaef75))
* removed as-legacy-globals-for-extension-api ([f1f2634](https://github.com/lensapp/lens/commit/f1f26344900b99c70b2bed2f453ed27574d7b417))
* removed dependencies: [reactApplicationFeature], ([0dae159](https://github.com/lensapp/lens/commit/0dae1594baabbd06e798f9a1b4c132cee998bb65))


### Features

* Add deleting subNamespaces to contextMenu ([89cf491](https://github.com/lensapp/lens/commit/89cf491bc0aa80ee398f8b5dc39ec7c69d00c7bb))
* Add removing subNamespaces to Namespace route ([aa95002](https://github.com/lensapp/lens/commit/aa950026a3162abf6322afb4b5c5bf56f9f7e10f))
* Adjust container status colors to be distinguable with red/green filter ([#7621](https://github.com/lensapp/lens/issues/7621)) ([3532fc1](https://github.com/lensapp/lens/commit/3532fc1dab918190fa76199a9d7b04d6efe40c47))
* Compute the kubectl download version map at build time ([0bd7b1f](https://github.com/lensapp/lens/commit/0bd7b1fe92a173379c8a5a1ab7e13cf9e4f8223b))
* Improve formatting error messages from apiKube ([3439472](https://github.com/lensapp/lens/commit/3439472065e6b850e286f6a34bccc23b827b8e28))
* Introduce API for changing the status bar colour ([06a0dce](https://github.com/lensapp/lens/commit/06a0dce612b67084f8f36ba552ea23f8ac071201))
* Introduce injectables to remove subNamespaces ([c557225](https://github.com/lensapp/lens/commit/c5572257bd6a32a2f05fc78f54ece428f54389fe))
* Never auto-close error notifications ([561d8db](https://github.com/lensapp/lens/commit/561d8dbc09581ff21aa79e85f3903c45e99ac33b))



# 6.5.0-alpha.6 (2023-04-12)



# 6.5.0-alpha.5 (2023-04-12)



# 6.5.0-alpha.4 (2023-04-12)


### Bug Fixes

* Fix tests by recreating non-specific injection token ([c0ebe60](https://github.com/lensapp/lens/commit/c0ebe605c4d36c0d98454e25565818f75ffb1b69))
* Referencing apiManager should not throw ([#7468](https://github.com/lensapp/lens/issues/7468)) ([351f9d4](https://github.com/lensapp/lens/commit/351f9d492f6e52e9e97d17d71e2bbdbbde4ea2db))
* remove platform specific injectable file names ([9b0318b](https://github.com/lensapp/lens/commit/9b0318b493fe2e49a34b8a4cb3d0bef1600759b8))


### Features

* Allow built versions to specify an environment ([#7495](https://github.com/lensapp/lens/issues/7495)) ([128b05d](https://github.com/lensapp/lens/commit/128b05d4d46344a511398f654865c133c6e36514))


### Reverts

* Revert "Renderer file logging through IPC" (#7393) ([5409324](https://github.com/lensapp/lens/commit/54093242367717292312df01905d052b66017953)), closes [#7393](https://github.com/lensapp/lens/issues/7393)



# 6.5.0-alpha.3 (2023-03-15)



# 6.5.0-alpha.2 (2023-03-14)



# 6.5.0-alpha.1 (2023-03-14)


### Reverts

* Revert "Renderer file logging transport (#6795)" (#7245) ([ec81af4](https://github.com/lensapp/lens/commit/ec81af4e6c5f8d0c25469a56dfa602894f85734b)), closes [#6795](https://github.com/lensapp/lens/issues/6795) [#7245](https://github.com/lensapp/lens/issues/7245) [#544](https://github.com/lensapp/lens/issues/544)



# 6.4.0-beta.13 (2023-02-03)



# 6.4.0-beta.12 (2023-02-01)



# 6.4.0-beta.11 (2023-02-01)



# 6.4.0-beta.10 (2023-01-27)



# 6.4.0-beta.9 (2023-01-27)



# 6.4.0-beta.8 (2023-01-27)



# 6.4.0-beta.7 (2023-01-27)



# 6.4.0-beta.6 (2023-01-26)



# 6.4.0-beta.5 (2023-01-26)



# 6.4.0-beta.4 (2023-01-26)



# 6.4.0-beta.3 (2023-01-26)





# 6.5.0-alpha.9 (2023-05-04)


### Bug Fixes

* Add checks to KubeObject constructor to ensure shape ([bf6af58](https://github.com/lensapp/lens/commit/bf6af58d80552a16be7a547f772902b138a12fbd))
* add routingFeature to getDiForUnitTesting ([b33a8b4](https://github.com/lensapp/lens/commit/b33a8b49607935450f70b1d5535431ba416fc22e))
* change class name behaviour to limit snapshot diffs ([bfb2b8e](https://github.com/lensapp/lens/commit/bfb2b8e6591891b529d5cf0f8757ff8b7080e004))
* **core:** hide update button if downloading of an update fails ([f697742](https://github.com/lensapp/lens/commit/f6977428daa3f61482e7066689ebf7092b0fb2b1))
* Fix selfLink being missing from requestKubeResource ([b90e04e](https://github.com/lensapp/lens/commit/b90e04e02dfd18896d5f08f1bc36f90179635797))
* lint:fix ([76c11aa](https://github.com/lensapp/lens/commit/76c11aa697e3ada81c876fe8a3ac6e33b4ce8cb9))
* observableHistoryInjectionToken and 1 revert for GlobalOverride ([8c0220c](https://github.com/lensapp/lens/commit/8c0220c353c9047a2a4df570b598c31868b5f7e2))
* Only show Update Channel preferences when applicable ([43cedae](https://github.com/lensapp/lens/commit/43cedae7b05eaa7f932f2718939f7b856a1b86c5))
* Remove incorrect timeout on standard info notifications ([bcf95a6](https://github.com/lensapp/lens/commit/bcf95a65f1d2be91fa613f0da9d0ae978faaef75))
* removed as-legacy-globals-for-extension-api ([f1f2634](https://github.com/lensapp/lens/commit/f1f26344900b99c70b2bed2f453ed27574d7b417))
* removed dependencies: [reactApplicationFeature], ([0dae159](https://github.com/lensapp/lens/commit/0dae1594baabbd06e798f9a1b4c132cee998bb65))


### Features

* Add deleting subNamespaces to contextMenu ([89cf491](https://github.com/lensapp/lens/commit/89cf491bc0aa80ee398f8b5dc39ec7c69d00c7bb))
* Add removing subNamespaces to Namespace route ([aa95002](https://github.com/lensapp/lens/commit/aa950026a3162abf6322afb4b5c5bf56f9f7e10f))
* Adjust container status colors to be distinguable with red/green filter ([#7621](https://github.com/lensapp/lens/issues/7621)) ([3532fc1](https://github.com/lensapp/lens/commit/3532fc1dab918190fa76199a9d7b04d6efe40c47))
* Compute the kubectl download version map at build time ([0bd7b1f](https://github.com/lensapp/lens/commit/0bd7b1fe92a173379c8a5a1ab7e13cf9e4f8223b))
* Improve formatting error messages from apiKube ([3439472](https://github.com/lensapp/lens/commit/3439472065e6b850e286f6a34bccc23b827b8e28))
* Introduce API for changing the status bar colour ([06a0dce](https://github.com/lensapp/lens/commit/06a0dce612b67084f8f36ba552ea23f8ac071201))
* Introduce injectables to remove subNamespaces ([c557225](https://github.com/lensapp/lens/commit/c5572257bd6a32a2f05fc78f54ece428f54389fe))
* Never auto-close error notifications ([561d8db](https://github.com/lensapp/lens/commit/561d8dbc09581ff21aa79e85f3903c45e99ac33b))



# 6.5.0-alpha.6 (2023-04-12)



# 6.5.0-alpha.5 (2023-04-12)



# 6.5.0-alpha.4 (2023-04-12)


### Bug Fixes

* Fix tests by recreating non-specific injection token ([c0ebe60](https://github.com/lensapp/lens/commit/c0ebe605c4d36c0d98454e25565818f75ffb1b69))
* Referencing apiManager should not throw ([#7468](https://github.com/lensapp/lens/issues/7468)) ([351f9d4](https://github.com/lensapp/lens/commit/351f9d492f6e52e9e97d17d71e2bbdbbde4ea2db))
* remove platform specific injectable file names ([9b0318b](https://github.com/lensapp/lens/commit/9b0318b493fe2e49a34b8a4cb3d0bef1600759b8))


### Features

* Allow built versions to specify an environment ([#7495](https://github.com/lensapp/lens/issues/7495)) ([128b05d](https://github.com/lensapp/lens/commit/128b05d4d46344a511398f654865c133c6e36514))


### Reverts

* Revert "Renderer file logging through IPC" (#7393) ([5409324](https://github.com/lensapp/lens/commit/54093242367717292312df01905d052b66017953)), closes [#7393](https://github.com/lensapp/lens/issues/7393)



# 6.5.0-alpha.3 (2023-03-15)



# 6.5.0-alpha.2 (2023-03-14)



# 6.5.0-alpha.1 (2023-03-14)


### Reverts

* Revert "Renderer file logging transport (#6795)" (#7245) ([ec81af4](https://github.com/lensapp/lens/commit/ec81af4e6c5f8d0c25469a56dfa602894f85734b)), closes [#6795](https://github.com/lensapp/lens/issues/6795) [#7245](https://github.com/lensapp/lens/issues/7245) [#544](https://github.com/lensapp/lens/issues/544)



# 6.4.0-beta.13 (2023-02-03)



# 6.4.0-beta.12 (2023-02-01)



# 6.4.0-beta.11 (2023-02-01)



# 6.4.0-beta.10 (2023-01-27)



# 6.4.0-beta.9 (2023-01-27)



# 6.4.0-beta.8 (2023-01-27)



# 6.4.0-beta.7 (2023-01-27)



# 6.4.0-beta.6 (2023-01-26)



# 6.4.0-beta.5 (2023-01-26)



# 6.4.0-beta.4 (2023-01-26)



# 6.4.0-beta.3 (2023-01-26)
