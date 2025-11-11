const cardsWrapper = document.querySelector(".main-wrapper")
const pagesWrapper = document.querySelector(".pages-wrapper")
const main = document.querySelector("main")
const limitSelector = document.querySelector("#select-limit")

const optionsPagesLimit = [5, 10, 20, 50]



const baseURL = "https://jsonplaceholder.typicode.com/comments"
let page = 1

let responseData = [];


const getIsMobile = () => window.innerWidth < 850;


// create cards
let globalIndex = 1
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
    userName.innerHTML = globalIndex + '. - ' + data.name
    userEmail.innerHTML = data.email
    emailText.innerHTML = data.body
}
// ------------

const addSearchParams = () => {
    history.pushState(null, "", `?current-page=${page}&max-content=${limitSelector.value}`)
}

// create pages
const clearDOM = () => {
    cardsWrapper.innerHTML = ""
    pagesWrapper.innerHTML = ""
    globalIndex = 1
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
        pageBtn.onclick = () => {
            goToPage(elem)
            addSearchParams()
        }
        if (elem == "..") pageBtn.disabled = true
        if (elem == page) pageBtn.classList.add("selected-btn")
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
    if (currentPage == 1) pages.push(2, "..", maxPage)
    if (currentPage <= 3 && currentPage > 1) pages.push(2)
    if (currentPage == 2) pages.push(3, "..", maxPage)
    if (currentPage == 3) pages.push(3, 4, "..", maxPage)

    if (currentPage > 3 && maxPage - currentPage > 2) pages.push("..", prevLast, currentPage, nextLast, "..", maxPage)

    if (maxPage - currentPage == 2) pages.push("..", prevLast, currentPage, nextLast, maxPage)
    if (maxPage - currentPage == 1) pages.push("..", prevLast, currentPage, maxPage)
    if (maxPage == currentPage) pages.push("..", prevLast, maxPage)

    return pages
}
// ------------------

// fetch
let isLoading = false
const fetchFunc = async () => {
    if(isLoading) return
    isLoading = true
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
            globalIndex++
        })
        if(!getIsMobile()) createPages(totalCount)
        

    } catch (err) {
        console.log(err.status)
    } finally {
        isLoading = false
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
    addSearchParams()
}

// mobile scroll
main.onscroll = () => {
    if(!getIsMobile()) return
    // main.scrollHeight вся высота скролла 
    // main.offsetHeight - высота видимой зоны экрана
    // main.scrollTop - высота проскроленого 
    //
    console.log(main.scrollHeight - (main.offsetHeight * 2))
    console.log(main.scrollTop, 'main.scrollTop')
    if(main.scrollHeight - (main.offsetHeight * 2) < main.scrollTop ){
        console.log('ss')
        fetchFunc()
    }
}

// onLoad


const start = () => {
    createSelectOptions() // создаю опшин для селекта

    // получаю данные из урл для отображение стартовых 
    const params = new URLSearchParams(window.location.search);

    const searchParamPage = params.get("current-page")
    const searchParamLimit = params.get("max-content")

    if (searchParamPage !== null) page = searchParamPage
    if (searchParamLimit !== null) limitSelector.value = searchParamLimit;




    fetchFunc()

}


start()