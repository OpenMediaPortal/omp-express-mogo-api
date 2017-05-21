/**
*
* jsonCompare.array is used to avoid bad mocha checks of returning JSON
*
* Use the following code structure:
*
*    .expect(function(res) {
*         const r = jsonCompare.array(res.body.p1 , object.p1) ||
*                 jsonCompare.array(res.body.p2 , object.p2) ||
*                 jsonCompare.array(res.body.p3 , object.p3);
*
*         if (r) {
*             throw new Error(r);
*         }
c
*    })
*
* @author ojourmel
*/

exports.array = function (j1, j2)
{

    if ((j1 instanceof Array) && (j2 instanceof Array)) {
        if (j1.length === j2.length) {
            const l = j1.length;
            for(let i=0;i<l;i++){
                if (j1.indexOf(j2[i]) < 0) {
                    return j1 + ' != ' + j2 + ' As ' + j1[i] + ' != ' + j2[i];
                }
            }
        } else {
            return j1 + ', ' + j2 + ' are not the same length, ' + j1.length + ', ' + j2.length;
        }
    } else {
        return j1 + ', ' + j2 + ' are not both arrays';
    }
};

/**
*
* jsonCompare.property is used to avoid bad mocha checks of returning JSON
*
* Use the following code structure:
*
*    .expect(function(res) {
*         const r = jsonCompare.property(res.body.p1 , object.p1) ||
*                 jsonCompare.property(res.body.p2 , object.p2) ||
*                 jsonCompare.property(res.body.p3 , object.p3);
*
*         if (r) {
*             throw new Error(r);
*         }
*    })
*
* @author ojourmel
*/

exports.property = function (j1, j2)
{
    if (j1 != j2) {
        return j1 + ' != ' + j2;
    } else {
        return null;
    }
};
