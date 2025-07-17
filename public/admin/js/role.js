// public/admin/js/role.js

document.addEventListener('DOMContentLoaded', () => {
  // 1) Lưu trạng thái ban đầu
  const initialPermissions = PermissionHelper.exportPermissions();

  // 2) Gắn các event chung
  document.getElementById('btnToggleAll')
    .addEventListener('click', toggleAllPermissions);

  document.getElementById('btnReset')
    .addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn reset về trạng thái ban đầu?')) {
        PermissionHelper.importPermissions(initialPermissions);
        updateAllCounters();
      }
    });

  document.querySelectorAll('.select-all-checkbox')
    .forEach(cb => cb.addEventListener('change', toggleRolePermissions));

  document.getElementById('permissionForm')
    .addEventListener('submit', onSubmit);

  // Cập nhật counter ngay khi load
  updateAllCounters();
});

/** Hàm bật/tắt toàn bộ permissions */
function toggleAllPermissions() {
  const all = Array.from(document.querySelectorAll('.permission-checkbox'));
  const shouldCheck = !all.every(cb => cb.checked);
  all.forEach(cb => { cb.checked = shouldCheck; });
  updateAllCounters();
}

/** Chọn/Huỷ chọn toàn bộ theo 1 role */
function toggleRolePermissions(e) {
  const roleId = e.target.dataset.roleId;
  const cbs = document.querySelectorAll(`.permission-checkbox[data-role-id="${roleId}"]`);
  cbs.forEach(cb => { cb.checked = e.target.checked; });
  updateCounter(roleId);
}

/** Xử lý khi submit form */
function onSubmit(e) {
  const submitBtn = document.getElementById('submitButton');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="bi bi-spinner-border me-2"></i>Đang lưu...';

  if (!validateForm()) {
    e.preventDefault();
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="bi bi-save-fill me-2"></i>Lưu thay đổi';
  }
}

/** Các hàm helper đã có sẵn */
const PermissionHelper = {
  exportPermissions: () => {
    const out = {};
    document.querySelectorAll('.permission-checkbox').forEach(cb => {
      const rid = cb.dataset.roleId;
      out[rid] = out[rid]||[];
      if (cb.checked) out[rid].push(cb.value);
    });
    return out;
  },
  importPermissions: (permObj) => {
    document.querySelectorAll('.permission-checkbox').forEach(cb => {
      const rid = cb.dataset.roleId;
      cb.checked = permObj[rid]?.includes(cb.value) ?? false;
    });
  }
};

/** Cập nhật counter cho 1 role */
function updateCounter(roleId) {
  const cnt = document.querySelectorAll(
    `.permission-checkbox[data-role-id="${roleId}"]:checked`
  ).length;
  const el = document.querySelector(
    `th[data-role-id="${roleId}"] .permission-counter`
  );
  if (el) {
    el.textContent = `(${cnt})`;
    el.classList.toggle('text-success', cnt > 0);
    el.classList.toggle('text-muted', cnt === 0);
  }
}

/** Cập nhật counters tất cả roles */
function updateAllCounters() {
  document.querySelectorAll('.select-all-checkbox').forEach(cb => {
    updateCounter(cb.dataset.roleId);
  });
}

/** Kiểm tra form trước khi submit */
function validateForm() {
  const counts = {};
  document.querySelectorAll('.permission-checkbox').forEach(cb => {
    const rid = cb.dataset.roleId;
    counts[rid] = counts[rid]||0;
    if (cb.checked) counts[rid]++;
  });
  const empty = Object.entries(counts).filter(([,c]) => c === 0);
  if (empty.length) {
    return confirm('Một số vai trò sẽ không có quyền nào. Bạn có chắc muốn tiếp tục?');
  }
  return true;
}
