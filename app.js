var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id
    this.description = description
    this.value = value
    this.percentage = -1
  }

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100)
    } else {
      this.percentage = -1
    }
  }
  Expense.prototype.getPercentages = function () {
    return this.percentage
  }

  var Income = function (id, description, value) {
    this.id = id
    this.description = description
    this.value = value
  }

  var calculateTotal = function (type) {
    var sum = 0
    data.allItems[type].forEach(function (cur) {
      sum = sum + cur.value
    })
    data.totals[type] = sum
  }

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  }

  return {
    addItem: function (type, des, val) {
      var newItem, ID

      // Перевірка, чи існує вже об'єкт з таким описом
      var existingItem = data.allItems[type].find(function (cur) {
        return cur.description === des
      })

      // Якщо об'єкт існує, змінюємо його значення
      if (existingItem) {
        existingItem.value += val
        newItem = existingItem
      } else {
        // Якщо об'єкт не існує, створюємо новий
        if (data.allItems[type].length > 0) {
          ID = data.allItems[type][data.allItems[type].length - 1].id + 1
        } else {
          ID = 0
        }

        // Створюємо новий елемент на основі типу 'inc' або 'Exp'
        if (type === "exp") {
          newItem = new Expense(ID, des, val)
        } else if (type === "inc") {
          newItem = new Income(ID, des, val)
        }

        // Призначити ідентифікатор об'єкту Newitem перед тим, як додати його до масиву
        newItem.id = ID

        // Додаємо до нашої структуру даних
        data.allItems[type].push(newItem)
      }

      // повернути новий або модифікований елемент
      return newItem
    },
    deleteItem: function (type, id) {
      var ids, index

      data.allItems[type][id]

      ids = data.allItems[type].map(function (current) {
        return current.id
      })

      index = ids.indexOf(id)

      if (index !== -1) {
        data.allItems[type].splice(index, 1)
      }
    },

    calculateBudget: function () {
      // Обчисліть загальний дохід та витрати
      calculateTotal("exp")
      calculateTotal("inc")

      // Обчислити бюджет: дохід - витрати
      data.budget = data.totals.inc - data.totals.exp

      // Обчисліть відсоток доходу, який ми витратили
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
      } else {
        data.percentage = -1
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc)
      })
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentages()
      })
      return allPerc
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      }
    },
    budgetData: function () {
      return {
        INCOME_stat: data.allItems["inc"],
        EXPENSES_stat: data.allItems["exp"],
      }
    },
    testing: function () {
      console.log(data)
    },
  }
})()

var UIController = (function () {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    chartBtn: ".chart_btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
    canvasdiv: ".canvasdiv",
    canvas: "canvas",
    chart_type: ".chart_type",
    data_type: ".data_type",
    chart_btn_type: ".chart_btn_type",
    close_chart: ".close_chart",
  }

  var formatNumber = function (num, type) {
    var numSplit, int, dec
    num = Math.abs(num)
    num = num.toFixed(2)

    numSplit = num.split(".")
    int = numSplit[0]
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, int.length) // Введення: 23510, результат 23,510
    }
    dec = numSplit[1]

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec
  }

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i)
    }
  }

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      }
    },
    addListItem: function (obj, type) {
      var html, newHtml, element

      // Створити рядок HTML з текстом заповнювача
      if (type === "inc") {
        element = DOMstrings.incomeContainer
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description" data-description="%description%">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description" data-description="%description%">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }

      // Замінимо текст заповнювача
      newHtml = html.replace("%id%", obj.id)
      newHtml = newHtml.replace(/%description%/g, obj.description)
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type))

      // Перевіримо, чи є елемент з тим самим описом
      var existingElement = document.querySelector(element + ' [data-description="' + obj.description + '"]')

      // Якщо елемент існує, видалимо його
      if (existingElement) {
        existingElement.parentNode.parentNode.removeChild(existingElement.parentNode)
      }

      // вставити HTML в DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml)
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID)
      el.parentNode.removeChild(el)
    },

    clearFields: function () {
      var fields, fieldsArr

      fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue)

      fieldsArr = Array.prototype.slice.call(fields)

      fieldsArr.forEach(function (current, index, array) {
        current.value = ""
      })
      fieldsArr[0].focus()
    },

    displayBudget: function (obj) {
      var type = obj.budget > 0 ? "inc" : obj.budget < 0 ? "exp" : " "
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type)
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc")
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp")

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%"
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---"
      }
    },

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel)

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%"
        } else {
          current.textContent = "---"
        }
      })
    },

    displayMonth: function () {
      var now, months, month, year
      now = new Date()
      months = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"]
      month = now.getMonth()
      console.log(month)
      year = now.getFullYear()
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year
    },

    changedType: function () {
      var fields = document.querySelectorAll(DOMstrings.inputType + "," + DOMstrings.inputDescription + "," + DOMstrings.inputValue)

      nodeListForEach(fields, function (cur) {
        cur.classList.add("red-focus")
      })

      document.querySelector(DOMstrings.inputBtn).classList.toggle("red")
    },

    getDOMstrings: function () {
      return DOMstrings
    },
  }
})()

var controller = (function (budgetCtrl, UICtrl) {
  var setupEventListener = function () {
    var DOM = UICtrl.getDOMstrings()

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem)

    document.querySelector(DOM.chartBtn).addEventListener("click", getChart)
    document.querySelector(DOM.chart_btn_type).addEventListener("click", getChart)
    document.querySelector(DOM.close_chart).addEventListener("click", closeChart)

    document.addEventListener("keypress", function (event) {
      if (event.keyCode == 13 || event.which === 13) {
        ctrlAddItem()
      }
    })

    document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem)

    document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType)
  }

  var updateBudget = function () {
    // 1. Обчислити бюджет
    budgetCtrl.calculateBudget()

    // 1. Обчислити бюджет
    var budget = budgetCtrl.getBudget()

    // 5. Відобразити бюджет в UI
    UICtrl.displayBudget(budget)
    //  Важлива частина коду
    return budget
  }

  var getChart = function () {
    var DOM = UICtrl.getDOMstrings()
    var budget = updateBudget()
    let canvasdiv = document.querySelector(DOM.canvasdiv)

    let canvas = window.document.querySelector(DOM.canvas)
    let ctx = canvas.getContext("2d")
    let chart_type = document.querySelector(DOM.chart_type).value
    let data_type = document.querySelector(DOM.data_type).value

    let budgetData = budgetController.budgetData()
    let incomeLabels = budgetData.INCOME_stat.map(function (obj) {
      return obj.description
    })
    let expensesLabels = budgetData.EXPENSES_stat.map(function (obj) {
      return obj.description
    })
    let incomeData = budgetData.INCOME_stat.map(function (obj) {
      return obj.value
    })
    let expensesData = budgetData.EXPENSES_stat.map(function (obj) {
      return obj.value
    })
    let chartLabels = ""
    let chartData = ""
    let chartColor = ""

    canvasdiv.style.display = "flex"
    canvasdiv.style.width = "90%"
    canvasdiv.style.height = "80%"
    canvasdiv.style.backgroundColor = "#fff"
    Chart.defaults.font.size = 16

    // Перевірка, чи існує попередня діаграма
    if (window.MyChart) {
      // Видаляємо попередню діаграму
      window.MyChart.destroy()
    }
    switch (data_type) {
      case "inc_exp_data":
        chartLabels = ["Прибуток", "Витрати"]
        chartData = [budget.totalInc, budget.totalExp]
        chartColor = ["#28b9b5", "#ff5049"]
        break
      case "inc_data":
        chartLabels = incomeLabels
        chartData = incomeData
        chartColor = ["#E0FFFF", "#AFEEEE", "#7FFFD4", "#40E0D0", "#48D1CC", "#00CED1", "#5F9EA0", "#4682B4", "#B0C4DE"]
        break
      case "exp_data":
        chartLabels = expensesLabels
        chartData = expensesData
        chartColor = ["#FFA07A", "#DC143C", "#FF0000", "#B22222", "#8B0000", "#CD5C5C", "#F08080", "#FA8072", "#E9967A"]
        break
    }

    let MyChart = new Chart(ctx, {
      type: chart_type,
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: "Сума в гривнях:",
            data: chartData,
            backgroundColor: chartColor,
            borderColor: ["#808080"],
            borderWidth: 3,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
      },
    })

    window.MyChart = MyChart
    console.log(MyChart)
  }
  var closeChart = function () {
    var DOM = UICtrl.getDOMstrings()

    let canvasdiv = document.querySelector(DOM.canvasdiv)
    canvasdiv.style.display = "none"
  }

  var updatePercentage = function () {
    // 1. Обчислити відсоток
    budgetCtrl.calculatePercentages()

    // 2. Відсотки від budget controller
    var percentages = budgetCtrl.getPercentages()
    // 3. Оновлення UI з новим відсотком
    UICtrl.displayPercentages(percentages)
  }

  var ctrlAddItem = function () {
    var input, newItem

    // 1. Отримати вхідні дані поля
    input = UICtrl.getInput()

    if (input.description !== " " && !isNaN(input.value) && input.value > 0) {
      // 2. Додати item до бюджетного контролера
      newItem = budgetCtrl.addItem(input.type, input.description, input.value)

      // 3. Додати item до UI

      UICtrl.addListItem(newItem, input.type)

      // 4. очистити поля
      UICtrl.clearFields()

      // 5. Обчислити та оновити бюджет
      updateBudget()

      // 6. Обчислити та оновити відсотки
      updatePercentage()
    }
  }

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

    if (itemID) {
      splitID = itemID.split("-")
      type = splitID[0]
      ID = parseInt(splitID[1])

      // 1. Видалити елемент зі структури даних
      budgetCtrl.deleteItem(type, ID)
      // 2. Видалити елемент із інтерфейсу користувача
      UICtrl.deleteListItem(itemID)
      // 3. Оновлення та показ нового бюджету
      updateBudget()

      // 4. Розрахунки та оновлення відсотків
      updatePercentage()
    }
  }

  return {
    init: function () {
      console.log("Work!")
      UICtrl.displayMonth()
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      })
      setupEventListener()
    },
  }
})(budgetController, UIController)

controller.init()
