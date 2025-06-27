
// Button Status
const ButtonStatus = document.querySelectorAll('[button-status]')

if (ButtonStatus.length > 0) {
    let url = new URL(window.location.href);
    ButtonStatus.forEach((button) => {
        button.addEventListener('click', () => {
            const status = button.getAttribute('button-status')

            if (status) {
                url.searchParams.set('status', status);
            } else {
                url.searchParams.delete('status');
            }
            window.location.href = url.href;
        })
    })
}

// End Button Status

// Form Search
const formSearch = document.querySelector('#form-search')
if (formSearch) {
    let url = new URL(window.location.href);

    formSearch.addEventListener('submit', (e) => {
        console.log("e", e);
        e.preventDefault()

        const keyword = e.target.elements.keyword.value
        console.log("keyword", keyword);

        if (keyword) {
            url.searchParams.set('keyword', keyword);
        } else {
            url.searchParams.delete('keyword');
        }

        window.location.href = url.href;
    })
}

//End Form Search

// Pagination
const Pagination = document.querySelectorAll('[button-pagination]')

if (Pagination.length > 0) {
    let url = new URL(window.location.href);
    Pagination.forEach((button) => {
        button.addEventListener('click', () => {
            const page = button.getAttribute('button-pagination')

            if (page) {
                url.searchParams.set('page', page);
            } else {
                url.searchParams.delete('page');
            }
            window.location.href = url.href;
        })
    })
}

// End Pagination

// Checkbox Multi
const checkboxMulti = document.querySelector('[checkbox-multi]')

if (checkboxMulti) {
    const inputCheckAll = document.querySelector('input[name="check-all"]')
    const inputsId = document.querySelectorAll('input[name="id"]')

    inputCheckAll.addEventListener('click', () => {
        if (inputCheckAll.checked) {
            inputsId.forEach((item) => {
                item.checked = true
            })
        } else {
            inputsId.forEach((item) => {
                item.checked = false
            })
        }
    })

    inputsId.forEach((item) => {
        item.addEventListener('click', () => {

            const countChecked = checkboxMulti.querySelectorAll(
                'input[name="id"]:checked'
            ).length

            if (countChecked === inputsId.length) {
                inputCheckAll.checked = true
            }
            else {
                inputCheckAll.checked = false
            }
        })
    })

}
// End Checkbox Multi

// Form Change Multi
const formChangeMulti = document.querySelector('[form-change-multi]')
if (formChangeMulti) {
    formChangeMulti.addEventListener('submit', (e) => {
        e.preventDefault()

        const checkboxMulti = document.querySelector('[checkbox-multi]')
        const inputsChecked = checkboxMulti.querySelectorAll(
            'input[name="id"]:checked'
        )

        const typeChange = formChangeMulti.querySelector('select[name="type"]').value
        console.log("typeChange", typeChange);

        if (typeChange === "delete-all") {
            const isConfirm = confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")
            if (!isConfirm) {
                return
            }
        }

        if (inputsChecked.length > 0) {
            let ids = []
            const inputIds = formChangeMulti.querySelector('input[name="ids"]')

            inputsChecked.forEach((item) => {
                const id = item.value

                if (typeChange === "change-position") {
                    const position = item
                        .closest("tr")
                        .querySelector("input[name='position']").value

                    ids.push(`${id}-${position}`)
                } else {
                    ids.push(id)
                }
            })

            inputIds.value = ids.join(', ')

            formChangeMulti.submit()

        } else {
            alert("Vui lòng chọn ít nhất một sản phẩm")
        }

        // Cách khác cho update nhiều sản phẩm
        // const inputsId = formChangeMulti.querySelectorAll('input[name="id"]:checked')
        // const status = formChangeMulti.querySelector('select[name="status"]').value

        // if (inputsId.length > 0) {
        //     const ids = Array.from(inputsId).map((item) => item.value).join(',')
        //     const action = formChangeMulti.getAttribute('data-path') + `/${status}/${ids}?_method=PATCH`

        //     formChangeMulti.action = action
        //     formChangeMulti.submit()
        // } else {
        //     alert("Vui lòng chọn ít nhất một sản phẩm")
        // }
    })

}
// End Form Change Multi

// Show Alert Timeout
const showAlert = document.querySelector('[show-alert]')
if (showAlert) {
    const time = parseInt(showAlert.getAttribute('data-time'))
    const closeAlert = showAlert.querySelector('[close-alert]')
    closeAlert.addEventListener('click', () => {
        showAlert.classList.add('alert-hidden')
    })
    setTimeout(() => {
        showAlert.classList.add('alert-hidden')
    }, time)

}

// End Show Alert Timeout

// Preview Image
const uploadImage = document.querySelector('[upload-image]')
if (uploadImage) {
    const uploadImageInput = document.querySelector('[upload-image-input]')
    const uploadImagePreview = document.querySelector('[upload-image-preview]')
    const uploadImageRemove = document.querySelector('[upload-image-remove]')

    uploadImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0]

        if (file) {
            // const reader = new FileReader()
            // reader.onload = function (event) {
            //     uploadImagePreview.src = event.target.result
            // }
            // reader.readAsDataURL(file)
            uploadImagePreview.src = URL.createObjectURL(file)
            uploadImageRemove.classList.remove('d-none')
        } else {
            uploadImagePreview.src = ''

        }
    })

    if (uploadImageRemove) {
        uploadImageRemove.addEventListener('click', () => {
            uploadImagePreview.src = ''
            uploadImageInput.value = ''
            uploadImageRemove.classList.add('d-none')
        })
    }
}
// End Preview Image


// Sort
const sort = document.querySelector('[sort]');

if (sort) {
    let url = new URL(window.location.href);

    const sortSelect = document.querySelector('[sort-select]');
    const sortClear = document.querySelector('[sort-clear]');

    sortSelect.addEventListener('change', (e) => {
        const value = e.target.value;
        const [sortKey, sortValue] = value.split('_');

        url.searchParams.set('sortKey', sortKey);
        url.searchParams.set('sortValue', sortValue);

        window.location.href = url.href;
    })

    sortClear.addEventListener('click', () => {
        url.searchParams.delete('sortKey');
        url.searchParams.delete('sortValue');

        window.location.href = url.href;
    })

    const sortKey = url.searchParams.get('sortKey');
    const sortValue = url.searchParams.get('sortValue');
    if (sortKey && sortValue) {
        const optionSelected = sortSelect.querySelector(`option[value="${sortKey}_${sortValue}"]`);
        optionSelected.selected = true;
    } 
}
// End Sort