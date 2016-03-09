/**
*
* jsonProperty.equal is used to avoid bad mocha checks of returning JSON
*
* Use the following code structure:
*
*    .expect(function(res) {
*         var r = jsonProperty.equal(res.body.p1 , object.p1) ||
*                 jsonProperty.equal(res.body.p2 , object.p2) ||
*                 jsonProperty.equal(res.body.p3 , object.p3);
*
*         if (r) {
*             throw new Error(r);
*         }
*    })
*
* @author ojourmel
*/

exports.equal = function (j1, j2)
{
    if (j1 != j2) {
        return "Error: " + j1 + " != " + j2;
    } else {
        return null;
    }
}
