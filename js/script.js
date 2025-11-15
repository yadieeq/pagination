const cardsWrapper = document.querySelector(".main-wrapper")
const pagesWrapper = document.querySelector(".pages-wrapper")
const main = document.querySelector("main")
const limitSelector = document.querySelector("#select-limit")

const mobileFirstBtn = document.querySelector("#first")
const mobileLastBtn = document.querySelector("#last")

const downBtn = document.querySelector("#down")
const upBtn = document.querySelector("#up")

const optionsPagesLimit = [5, 10, 20, 50]


const postId = document.querySelector("#post-id")
const postTitle = document.querySelector("#post-title")
const postBody = document.querySelector("#post-body")
const postBtn = document.querySelector("#post-btn")

const baseURL = "https://jsonplaceholder.typicode.com/"

let isLoadingPost = false
const postFunction = async () => {
    isLoadingPost = true
    try{
        const response = await fetch(baseURL + "comments", {
            method: "POST",
            body: JSON.stringify({ title: postTitle.value,  body: postBody.value, userId: postId.value}),
        });
        const data = await response.json()
        if (!response.ok) throw {
            status: response.status,
            text: data.message
        }

        console.log(data)

    } catch(e) {
        console.log(e)
    } finally {
        setTimeout(() => {
            isLoadingPost = false
        }, 150)
    }
}

postBtn.onclick = () => postFunction()



let page = 1

let responseData = [];


const getIsMobile = () => window.innerWidth < 850;

const configScroll = []
const pushConfigScroll = () => {
    const last = configScroll[configScroll.length - 1]
    configScroll.push({
        elementsHeight : [],
        startY : last ? last.endY : 0,
        endY : last ? last.endY : 0
    })
}

const addToConfigScroll = (cardHeight) => {
    const current = configScroll[configScroll.length - 1]

    current.elementsHeight.push(cardHeight)
    current.endY += cardHeight //сумма высот всех карточек после последнего запроса (выполняется столько раз, сколько пришло карточек в ответе)
}

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
    
    const deleteCard = document.createElement("p")
    deleteCard.innerHTML = "X"
    deleteCard.classList.add("delete-card")
    deleteCard.onclick = () => cardsWrapper.removeChild(card)

    card.append(userName, userEmail, emailText, deleteCard)
    cardsWrapper.appendChild(card)
    userName.innerHTML = data.id + '. - ' + data.name
    userEmail.innerHTML = data.email
    emailText.innerHTML = data.body

    //! 
    addToConfigScroll(card.offsetHeight)
    
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
    configScroll.length = 0
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
    isLoading = true
    try {
        const response = await fetch(`${baseURL}comments?_page=${page}&_limit=${limitSelector.value}`)
        const data = await response.json()

        if (!response.ok) throw {
            status: response.status,
            text: data.message
        }

        const totalCount = +response.headers.get("x-total-count")

        pushConfigScroll();

        responseData = data
        responseData.forEach((elem) => {
            createCard(elem)
            globalIndex++
        })
        // console.log(configScroll)

        if(!getIsMobile()) {
            createPages(totalCount)
        }
        
        

    } catch (err) {
        console.log(err.status)
    } finally {
        setTimeout(() => {
            isLoading = false
        }, 150)
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
const goTofirstPage = () => {
    page = 1
    history.pushState(null, "", `?current-page=${page}&max-content=${limitSelector.value}`)
    clearDOM()
    fetchFunc()
}
const goToLastPage = () => {
    
}
mobileFirstBtn.onclick = goTofirstPage


const mobileFetch = async () => {
    if(isLoading) return
    page++
    await fetchFunc();
    history.pushState(null, "", `?current-page=${page}&max-content=${limitSelector.value}`)
    console.log(1)
}

main.onscroll = () => {
    if(!getIsMobile()) return;
    
    if(main.scrollHeight - (main.offsetHeight * 2) < main.scrollTop ){
        // console.log('ss')        
        mobileFetch()
    }
}

let currentPageGroupIndex = 0;
const scrollToPageGroup = (index) => {
    const pageGroup = configScroll[index];
    if (!pageGroup) return;
    main.scrollTo({
        top: pageGroup.startY,
        behavior: "smooth"
    });
    currentPageGroupIndex = index;

};

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

downBtn.onclick = async () => {
    const next = currentPageGroupIndex + 1;
    if (next < configScroll.length) {
        scrollToPageGroup(next);
        return
    }

     if (isLoading) return;

    page++;
    await fetchFunc()
    scrollToPageGroup(next)
};

upBtn.onclick = () => {
    const prev = currentPageGroupIndex - 1;
    if (prev >= 0) {
        scrollToPageGroup(prev);
    }
};

start()


