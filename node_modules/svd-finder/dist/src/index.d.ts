interface SVDResult {
    /**
     * A vector holding the singular values of `A`; they are non-negative but not necessarily ordered in
     *      decreasing sequence
     */
    q: number[];
    /**
     * Represents the matrix U with orthonormalized columns (`if withu is true` otherwise `u` is used as
     *      a working storage)
     */
    u: number[][];
    /**
     * Represents the orthogonal matrix V (`if withv === true`, otherwise `v` is not used)
     */
    v: number[][];
}
interface SVDParameters {
    /** if U is desired */
    u?: boolean;
    /** if V is desired */
    v?: boolean;
    /** constant used in the test for convergence; should not be smaller than the machine precision */
    eps?: number;
}
/** SVD procedure as explained in "Singular Value Decomposition and Least Squares Solutions. By G.H. Golub et al."
 *
 * This procedure computes the singular values and complete orthogonal decomposition of a real rectangular matrix A:
 *
 * `A = U * diag(q) * V(t), U(t) * U = V(t) * V = I`
 *
 * where the arrays `a`, `u`, `v`, `q` represent `A`, `U`, `V`, `q` respectively. The actual parameters corresponding to `a`, `u`, `v` may
 * all be identical unless `withu = withv = true`. In this case, the actual parameters corresponding to `u` and `v` must
 * differ. `m >= n` is assumed (with `m = a.length` and `n = a[0].length`)
 *
 *  @param a  Represents the matrix A to be decomposed
 *  @param options SVD options
 *
 * @returns {SVDResult} the result of the svd
 */
export default function SVD(a: number[][], options?: SVDParameters): SVDResult;
export {};
