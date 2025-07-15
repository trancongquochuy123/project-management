// Hàm đệ quy để tạo cấu trúc cây phân cấp 
/**✅ Cách 1 Ưu điểm:
So sánh ObjectId một cách an toàn.

Tạo newItem bằng { ...item } để tránh gán tham chiếu trực tiếp (nếu cần clone object).

Giữ nguyên children nếu có, bỏ qua nếu không có để cây gọn.

***/
// function createTree(arr, parentId = null) {
//     const tree = [];
//     arr.forEach(item => {
//         const itemParentId = item.parent_id ? item.parent_id.toString() : null;
//         const currParentId = parentId ? parentId.toString() : null;

//         if (itemParentId === currParentId) {
//             const newItem = { ...item.toObject?.() || item }; // đảm bảo là plain object
//             const children = createTree(arr, item._id);

//             if (children.length > 0) {
//                 newItem.children = children;
//             }
//             tree.push(newItem);
//         }
//     });
//     return tree;
// }

/**✅ Cách 2 Ưu điểm:
 * So sánh parent_id an toàn với toString().
 * Tạo đối tượng mới từ item để tránh tham chiếu trực tiếp.
 * Giữ nguyên children nếu có, bỏ qua nếu không có để cây gọn.
 * Sử dụng toObject() để đảm bảo là plain object.
 **/

let count = 0;

module.exports.createTree = function createTree(arr, parentId = null) {
    count = 0; 

    function buildTree(arr, parentId = null) {
        const tree = [];

        arr.forEach(item => {
            if ((item.parent_id?.toString() || null) === (parentId?.toString() || null)) {
                count++;
                const newItem = item.toObject?.() || { ...item };
                newItem.index = count;

                const children = buildTree(arr, item._id);
                if (children.length > 0) {
                    newItem.children = children;
                }

                tree.push(newItem);
            }
        });

        return tree;
    }

    const result = buildTree(arr, parentId);
    return result;
};

