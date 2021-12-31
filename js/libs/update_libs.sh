#!/bin/bash

mkdir -p /var/tmp/repos/tensorflow
if [[ -d /var/tmp/repos/tensorflow/tfjs ]]; then
  pushd /var/tmp/repos/tensorflow/tfjs
  git pull
  cd tfjs-vis
  yarn
  yarn build
else
  pushd /var/tmp/repos/tensorflow/
  git clone --depth=1 https://github.com/tensorflow/tfjs.git
  yarn
  yarn build
fi
popd
cp /var/tmp/repos/tensorflow/tfjs/tfjs-vis/dist/tfjs-vis* ./

mkdir -p /var/tmp/repos/mrdoob
if [[ -d /var/tmp/repos/mrdoob/three.js ]]; then
  pushd /var/tmp/repos/mrdoob/three.js
  git pull
else
  pushd /var/tmp/repos/mrdoob/
  git clone --depth=1 https://github.com/mrdoob/three.js.git
fi
popd
cp /var/tmp/repos/mrdoob/three.js/build/three.min.js ./
cp /var/tmp/repos/mrdoob/three.js/examples/js/libs/stats.min.js ./
cp /var/tmp/repos/mrdoob/three.js/examples/js/controls/OrbitControls.js ./
cp /var/tmp/repos/mrdoob/three.js/examples/js/loaders/GLTFLoader.js ./
