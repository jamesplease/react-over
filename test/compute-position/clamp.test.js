import clamp from '../../src/compute-position/clamp';

const specs = [
  {
    args: [0, 0, 10],
    result: 0,
  },
  {
    args: [0, -1, 10],
    result: 0,
  },
  {
    args: [0, -10, 10],
    result: 0,
  },
  {
    args: [0, 5, 10],
    result: 5,
  },
  {
    args: [0, 10, 10],
    result: 10,
  },
  {
    args: [0, 15, 10],
    result: 10,
  },
];

describe('clamp', () => {
  it('computes the expected values', () => {
    specs.forEach(spec => {
      expect(clamp(...spec.args)).toEqual(spec.result);
    });
  });
});
