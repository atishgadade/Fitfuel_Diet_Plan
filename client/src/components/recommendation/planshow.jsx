import React, { useState, useEffect } from 'react';
import "../../styles/planshow.css";
import { X } from 'lucide-react'; // You'll install lucide-react (better than feather-icons in React)

const mealsData = {
  low: [
    {
      name: "Poha with Veggies",
      image: "poha.jpg",
      ingredients: ["1 cup flattened rice (poha)", "1/4 cup peas", "1/4 cup carrots, diced", "1 small onion, chopped", "1/2 tsp mustard seeds", "1 tbsp oil", "Salt to taste"],
      preparation: ["Rinse poha in water and drain immediately.", "Heat oil in a pan, add mustard seeds and let them splutter.", "Add onions and sauté until translucent.", "Add peas and carrots, cook for 2-3 minutes.", "Add the drained poha, salt, and mix well.", "Cook for 5 minutes on low heat, stirring occasionally.", "Serve hot with lemon wedges."]
    },
    {
      name: "Masala Oats",
      image: "masala-oats.jpg",
      ingredients: ["1 cup rolled oats", "1/2 cup mixed vegetables (carrots, beans, peas)", "1 small onion, chopped", "1/2 tsp turmeric powder", "1/2 tsp chili powder", "1 tsp oil", "2 cups water", "Salt to taste"],
      preparation: ["Heat oil in a pan, add onions and sauté until golden.", "Add vegetables and cook for 2-3 minutes.", "Add turmeric, chili powder, and salt. Mix well.", "Add oats and water, stir to combine.", "Bring to a boil, then reduce heat and simmer for 5 minutes.", "Serve hot with yogurt or chutney."]
    }
  ],
  mid: [
    {
      name: "Quinoa Vegetable Pulao",
      image: "quo.jpg",
      ingredients: ["1 cup quinoa, rinsed", "1/2 cup mixed vegetables (carrots, beans, peas)", "1 small onion, sliced", "1 tsp ginger-garlic paste", "1/2 tsp garam masala", "1 tbsp oil", "2 cups vegetable broth", "Salt to taste"],
      preparation: ["Heat oil in a pressure cooker, add onions and sauté until golden.", "Add ginger-garlic paste and sauté for 30 seconds.", "Add vegetables and cook for 2-3 minutes.", "Add quinoa, garam masala, and salt. Mix well.", "Add vegetable broth and pressure cook for 2 whistles.", "Let pressure release naturally, fluff with fork before serving."]
    },
    {
      name: "Chickpea & Avocado Salad",
      image: "chickpea.jpg",
      ingredients: ["1 cup boiled chickpeas", "1 ripe avocado, diced", "1/4 cup red onion, finely chopped", "1 tbsp olive oil", "1 tbsp lemon juice", "Salt and pepper to taste", "Fresh cilantro for garnish"],
      preparation: ["In a large bowl, combine chickpeas, avocado, and red onion.", "In a small bowl, whisk together olive oil, lemon juice, salt, and pepper.", "Pour dressing over the salad and toss gently to combine.", "Garnish with fresh cilantro before serving.", "Serve chilled with whole grain bread."]
    }
  ],
  high: [
    {
      name: "Vegan Buddha Bowl",
      image: "buddhabwl.jpg",
      ingredients: ["1/2 cup cooked quinoa", "1/2 cup baked tofu cubes", "1/4 avocado, sliced", "1/4 cup roasted chickpeas", "1 cup mixed greens", "1 tbsp pumpkin seeds", "2 tbsp tahini dressing", "1 tsp sesame seeds"],
      preparation: ["Cook quinoa according to package instructions.", "Bake tofu cubes at 400°F for 20 minutes, flipping halfway.", "Roast chickpeas with olive oil and spices for 25 minutes at 400°F.", "Arrange all ingredients in a bowl starting with greens as base.", "Drizzle with tahini dressing and sprinkle sesame seeds.", "Serve immediately."]
    },
    {
      name: "Zucchini Noodles with Pesto",
      image: "pesto.jpg",
      ingredients: ["2 medium zucchinis, spiralized", "1/4 cup vegan pesto", "1/2 cup cherry tomatoes, halved", "1 tbsp pine nuts", "1 tbsp nutritional yeast", "Salt and pepper to taste", "Fresh basil for garnish"],
      preparation: ["Spiralize zucchinis using a spiralizer or julienne peeler.", "In a large bowl, toss zucchini noodles with pesto until well coated.", "Add cherry tomatoes and pine nuts, toss gently.", "Season with salt, pepper, and nutritional yeast.", "Garnish with fresh basil leaves before serving.", "Can be served cold or lightly sautéed for 1-2 minutes."]
    }
  ]
};

const planshow = () => {
  const [budget, setBudget] = useState('low');
  const [selectedMeal, setSelectedMeal] = useState(null);

  const budgets = [
    { id: 'low', label: 'Low Budget' },
    { id: 'mid', label: 'Mid Budget' },
    { id: 'high', label: 'High Budget' }
  ];

  return (
    <>
      {/* Tailwind CDN already in index.html OR you can remove and use your own tailwind setup */}
      <div className="min-h-screen bg-light text-dark font-sans py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold text-primary mb-3">VeggieFuel Feast Planner</h1>
            <p className="text-xl text-gray-600">Discover delicious vegetarian & vegan meals tailored to your budget</p>
          </header>

          {/* Budget Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-lg shadow-sm" role="group">
              {budgets.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBudget(b.id)}
                  className={`px-8 py-3 text-sm font-semibold transition-all ${
                    budget === b.id
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  } ${b.id === 'low' ? 'rounded-l-lg' : ''} ${b.id === 'high' ? 'rounded-r-lg' : ''} border border-gray-300`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Meals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mealsData[budget].map((meal, index) => (
              <div
                key={index}
                onClick={() => setSelectedMeal(meal)}
                className="meal-card bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="h-56 overflow-hidden">
                  <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-primary mb-4">{meal.name}</h3>
                  <button className="w-full py-3 bg-secondary text-dark font-semibold rounded-lg hover:bg-primary hover:text-white transition">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
        {selectedMeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4" onClick={() => setSelectedMeal(null)}>
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-screen overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-3xl font-bold text-primary">{selectedMeal.name}</h3>
                  <button onClick={() => setSelectedMeal(null)} className="text-gray-500 hover:text-gray-800">
                    <X size={32} />
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <img src={selectedMeal.image} alt={selectedMeal.name} className="w-full h-64 object-cover rounded-xl shadow-md" />
                  </div>

                  <div className="md:col-span-2 space-y-8">
                    <div>
                      <h4 className="text-2xl font-bold text-primary mb-4">Ingredients</h4>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        {selectedMeal.ingredients.map((ing, i) => (
                          <li key={i}>{ing}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-2xl font-bold text-primary mb-4">Preparation</h4>
                      <ol className="list-decimal pl-6 space-y-3 text-gray-700">
                        {selectedMeal.preparation.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default planshow;