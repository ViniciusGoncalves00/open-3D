export const BindingGroups = {
  camera: {
    group: 0,
    binding: 0,
  },
  model: {
    group: 0,
    binding: 1,
  },
  light: {
    group: 1,
    binding: 0,
  },
  environmentMap: {
    group: 1,
    binding: 1,
  },
  shadowMap: {
    group: 1,
    binding: 2,
  },
  material: {
    pbrUniform: {
      group: 2,
      binding: 0,
    },
    baseColorTexture: {
      group: 2,
      binding: 1,
    },
    baseColorSampler: {
      group: 2,
      binding: 2,
    },
  },
};