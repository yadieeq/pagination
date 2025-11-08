const cardsWrapper = document.querySelector(".main-wrapper")
const pagesWrapper = document.querySelector(".pages-wrapper")
const limitSelector = document.querySelector("#select-limit")

const optionsPagesLimit = [5, 10, 20,50]

const baseURL = "https://jsonplaceholder.typicode.com/comments"
let page = 1
let responseData = []


// create cards
const createCard = (data) => {
    const card = document.createElement("div")
    card.classList.add("card")

    const userName = document.createElement("h4")
    userName.classList.add("name")
    const userEmail = document.createElement("h5")
    userEmail.classList.add("email")
    const emailText = document.createElement("p")
    emailText.classList.add("text")

    card.append(userName, userEmail, emailText)
    cardsWrapper.appendChild(card)
    userName.innerHTML = data.name
    userEmail.innerHTML = data.email
    emailText.innerHTML = data.body
}
// ------------

// create pages
const clearDOM = () => {
    cardsWrapper.innerHTML = ""
    pagesWrapper.innerHTML = ""
}

const goToPage = (pageNum) => {
    page = pageNum
    clearDOM()
    fetchFunc()
}

const createPages = (totalCount) => {
    const pageLimit = Math.ceil(totalCount / limitSelector.value)
    const pages = getArrayForPages(pageLimit, page);

    pages.forEach((elem) => {
        const pageBtn = document.createElement("button")
        pageBtn.classList.add("page-number")
        pageBtn.onclick = () => goToPage(elem)
        if(elem == "..") pageBtn.disabled = true
        pageBtn.innerHTML = elem
        
        pagesWrapper.appendChild(pageBtn)
    })
}

const getArrayForPages = (maxPage, currentPage) => {
    const prevLast = currentPage - 1;
    const nextLast = currentPage + 1;

    let pages = []

    if (maxPage <= 7) {
        for (let i = 1; i <= maxPage; i++) pages.push(i)
        return pages
    }

    pages = [1];
    if (currentPage == 1) pages.push(2,"..",maxPage)
    if (currentPage <= 3 && currentPage > 1) pages.push(2)
    if (currentPage == 2) pages.push(3, "..",maxPage)
    if (currentPage == 3) pages.push(3, 4, "..",maxPage)

    if (currentPage > 3 && maxPage - currentPage > 2) pages.push("..", prevLast, currentPage, nextLast, "..", maxPage)

    if (maxPage - currentPage == 2) pages.push("..", prevLast, currentPage, nextLast, maxPage)
    if (maxPage - currentPage == 1) pages.push("..", prevLast, currentPage, maxPage)
    if (maxPage == currentPage) pages.push("..", prevLast, maxPage)

    return pages
}
// ------------------

// fetch
const fetchFunc = async () => {
    try {
        const response = await fetch(`${baseURL}?_page=${page}&_limit=${limitSelector.value}`)
        const data = await response.json()

        if (!response.ok) throw {
            status: response.status,
            text: data.message
        }

        const totalCount = +response.headers.get("x-total-count");
        responseData = data
        responseData.forEach((elem) => {
            createCard(elem)
        })
        createPages(totalCount)

    } catch (err) {
        console.log(err.status)
    }
}
// --------------------

//select
const createSelectOptions = () => {
    optionsPagesLimit.forEach((elem) => {
        const selectOption = document.createElement("option")
        selectOption.value = elem
        selectOption.innerHTML = elem
        limitSelector.appendChild(selectOption)
    })
}

limitSelector.onchange = () => {
    clearDOM()
    fetchFunc()
}

// onLoad
fetchFunc()
createSelectOptions()