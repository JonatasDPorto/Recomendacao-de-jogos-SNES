# Singular Value Decomposition port to js

This procedure computes the singular values and complete orthogonal decomposition of a real rectangular matrix A:

```ts
A = U * diag(q) * V(t), U(t) * U = V(t) * V = I
```

where the arrays `a`, `u`, `v`, `q` represent `A`, `U`, `V`, `q` respectively. The actual parameters corresponding to `a`, `u`, `v` may
all be identical unless `withu = withv = true`. In this case, the actual parameters corresponding to `u` and `v` must
differ.

`m >= n` is assumed (with `m = a.length` and `n = a[0].length`)

## Usage:

```ts
let a = [
  [22, 10, 2, 3, 7],
  [14, 7, 10, 0, 8],
  [-1, 13, -1, -11, 3],
  [-3, -2, 13, -2, 4],
  [9, 8, 1, -2, 4],
  [9, 1, -7, 5, -1],
  [2, -6, 6, 5, 1],
  [4, 5, 0, -2, 2]
];

let { u, v, q } = SVD(a);
```

## `SVD(a [options])`

### Parameters

```ts
// Represents the matrix A to be decomposed
a: number[][]
```

#### Options

```ts
{
  // if U is desired `false` otherwise
  u: boolean = true,

  // if V is desired `false` otherwise
  v: boolean = true,

  // A constant used in the test for convergence; should not be smaller than the machine precision
  eps: number = Math.pow(2, -52)
}
```

### Result

```ts
{
  // Represents the matrix U with orthonormalized columns (`if withu is true` otherwise `u` is used as a working storage)
  u: number[][],

  //Represents the orthogonal matrix V (`if u === true`, otherwise `v` is not used)
  v: number[][],

  // A vector holding the singular values of `A`; they are non-negative but not necessarily ordered in decreasing sequence
  q: number[]
}
```
