function startApp() {
  const result = document.querySelector('#result')

  const selectCategories = document.querySelector('#categories')

  if (selectCategories) {
    selectCategories.addEventListener('change', selectCategory)
    getAllCategories()
  }

  const favoritesRecipe = document.querySelector('.favoritos')

  if (favoritesRecipe) {
    getFavorites()
  }

  const modal = new bootstrap.Modal('#modal', {})

  function getAllCategories() {
    const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'
    fetch(url)
      .then((res) => res.json())
      .then((result) => showCategories(result.categories))
  }

  function showCategories(categories = []) {
    categories.forEach((category) => {
      const { strCategory } = category
      const option = document.createElement('OPTION')
      option.value = strCategory
      option.textContent = strCategory
      selectCategories.appendChild(option)
    })
  }

  function selectCategory(e) {
    const category = e.target.value
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
    fetch(url)
      .then((res) => res.json())
      .then((result) => showRecipes(result.meals))
  }

  function showRecipes(recipes = []) {
    eraseHtml(result)

    const heading = document.createElement('H2')
    heading.classList.add('text-center', 'text-black', 'my-5')
    heading.textContent = recipes.length ? 'Resultado' : 'No Hay Resultado'
    result.appendChild(heading)

    recipes.forEach((dish) => {
      const { idMeal, strMeal, strMealThumb } = dish

      const dishContainer = document.createElement('DIV')
      dishContainer.classList.add('col-md-4')

      const dishCard = document.createElement('DIV')
      dishCard.classList.add('card', 'mb-4')

      const dishImage = document.createElement('IMG')
      dishImage.classList.add('card-img-top')
      dishImage.alt = `Imagen de la receta ${strMeal ?? dish.titulo}`
      dishImage.src = strMealThumb ?? dish.img

      const dishCardBody = document.createElement('DIV')
      dishCardBody.classList.add('card-body')

      const dishHeading = document.createElement('H3')
      dishHeading.classList.add('card-title', 'mb-3')
      dishHeading.textContent = strMeal ?? dish.titulo

      const dishButton = document.createElement('BUTTON')
      dishButton.classList.add('btn', 'btn-primary', 'w-100')
      dishButton.textContent = 'Ver Receta'

      dishButton.onclick = function () {
        selectDish(idMeal ?? dish.id)
      }

      dishCardBody.appendChild(dishHeading)
      dishCardBody.appendChild(dishButton)

      dishCard.appendChild(dishImage)
      dishCard.appendChild(dishCardBody)

      dishContainer.appendChild(dishCard)
      result.appendChild(dishContainer)
    })
  }

  function selectDish(id) {
    const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    fetch(url)
      .then((res) => res.json())
      .then((result) => showDishModal(result.meals[0]))
  }

  function showDishModal(dish) {
    const { idMeal, strInstructions, strMeal, strMealThumb } = dish

    const modalTitle = document.querySelector('.modal .modal-title')
    const modalBody = document.querySelector('.modal .modal-body')

    modalTitle.textContent = strMeal
    modalBody.innerHTML = `<img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}" />
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredientes y Cantidades</h3>
        `

    const listGroup = document.createElement('UL')
    listGroup.classList.add('list-group')

    for (let i = 1; i <= 20; i++) {
      if (dish[`strIngredient${i}`]) {
        const ingredient = dish[`strIngredient${i}`]
        const quantity = dish[`strMeasure${i}`]

        const ingredientLi = document.createElement('LI')
        ingredientLi.classList.add('list-group-item')
        ingredientLi.textContent = `${ingredient} - ${quantity}`

        listGroup.appendChild(ingredientLi)
      }
    }

    modalBody.appendChild(listGroup)

    const modalFooter = document.querySelector('.modal-footer')
    eraseHtml(modalFooter)

    const btnFavorite = document.createElement('BUTTON')
    btnFavorite.classList.add('btn', 'btn-primary', 'col')
    btnFavorite.textContent = existsStorage(idMeal)
      ? 'Eliminar Favorito'
      : 'Guardar Favorito'

    btnFavorite.onclick = function () {
      if (existsStorage(idMeal)) {
        deleteFavorite(idMeal)
        btnFavorite.textContent = 'Guardar Favorito'
        showToast('Eliminado Correctamente')
        return
      }
      addFavorite({
        id: idMeal,
        titulo: strMeal,
        img: strMealThumb,
      })
      showToast('Agregado Correctamente')

      btnFavorite.textContent = 'Eliminar Favorito'
    }

    const btnCloseModal = document.createElement('BUTTON')
    btnCloseModal.classList.add('btn', 'btn-secondary', 'col')
    btnCloseModal.textContent = 'Cerrar'
    btnCloseModal.onclick = function () {
      modal.hide()
    }

    modalFooter.appendChild(btnFavorite)
    modalFooter.appendChild(btnCloseModal)

    modal.show()
  }

  function addFavorite(dish) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) ?? []
    localStorage.setItem('favorites', JSON.stringify([...favorites, dish]))
  }

  function deleteFavorite(id) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) ?? []
    const addFavorites = favorites.filter((favorite) => favorite.id !== id)
    localStorage.setItem('favorites', JSON.stringify(addFavorites))
  }

  function existsStorage(id) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) ?? []
    return favorites.some((favorite) => favorite.id === id)
  }

  function showToast(message) {
    const toastDiv = document.querySelector('#toast')
    const toastBody = document.querySelector('.toast-body')
    const toast = new bootstrap.Toast(toastDiv)
    toastBody.textContent = message
    toast.show()
  }

  function getFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) ?? []

    if (favorites.length) {
      showRecipes(favorites)
      return
    }

    const notFavorites = document.createElement('P')
    notFavorites.textContent = 'No hay Favoritos aún'
    notFavorites.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5')
    favoritesRecipe.appendChild(notFavorites)
  }

  function eraseHtml(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild)
    }
  }
}

document.addEventListener('DOMContentLoaded', startApp)
