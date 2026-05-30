import React, { useEffect } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import Footer from "../layout/Footer.jsx";
import { useAuth } from "../../context/AuthContext";
import ProfileButton from "./ProfileButton.jsx";
import logo from "../../assets/images/fitfuel_rectanglelogo.png";

export default function HealthyAlternatives() {
  const navigate = useNavigate();
  const { user, userData, handleLogout, handleDeleteAccount } = useAuth();

  useEffect(() => {
    document.title = "Fit-Fuel — Healthy Alternatives";
  }, []);

  const categories = {
    "Savory Snacks": [
      ["Potato Chips", "Baked vegetable chips (kale, sweet potato, beet), air-popped popcorn, or roasted chickpeas."],
      ["French Fries", "Baked sweet potato fries, roasted carrot sticks, or zucchini fries."],
      ["Tortilla Chips with processed cheese dip", "Baked tortilla chips with homemade salsa or fresh guacamole."],
      ["Salty Crackers", "Whole-grain crackers with hummus or avocado."],
      ["Pretzels", "Unsalted or low-sodium mixed nuts."],
      ["Cheesy Puffs", "Roasted edamame or plain, unsalted rice cakes."],
      ["Pork Rinds", "Roasted seaweed snacks."],
      ["Store-bought Onion Dip", "A dairy-free yogurt-based onion dip with fresh herbs and spices."],
    ],
    "Sweet Treats and Desserts": [
      ["Ice Cream", `"Nice cream" (blended frozen bananas), fruit sorbet, or non-dairy frozen dessert.`],
      ["Candy Bars", "Dates stuffed with almond butter, dried fruit, or a small piece of dark chocolate (70% cacao or higher)."],
      ["Gummy Candies", "Fresh or dried fruit (like apricots or raisins) or real-fruit leather."],
      ["Sugary Cereal", "Whole-grain cereal with fresh fruit, or overnight oats with berries and nuts."],
      ["Doughnuts or Pastries", "Whole-grain toast with nut butter and banana, or a homemade muffin with natural sweeteners."],
      ["Chocolate Chip Cookies", "Oatmeal cookies with natural sweeteners, or chocolate-covered strawberries."],
      ["Milk Chocolate", "Dark chocolate (at least 70% cacao) rich in antioxidants."],
      ["Flavored Yogurt", "Plain plant-based yogurt with fresh berries and agave drizzle."],
      ["Sugar-loaded Muffins", "Homemade muffins with fruit or veggies (carrots, zucchini) and less sugar."],
      ["Cake", "Vegan angel food cake with fresh berries or fruit salad."],
      ["Jell-O Pudding Cups", "Sugar-free jelly or chia seed pudding."],
    ],
    Beverages: [
      ["Soda", "Sparkling water with lemon/lime, or infused water with fruits and herbs."],
      ["Fruit Juice (from concentrate)", "Whole fruit for fiber and nutrients, or fresh juice with no added sugar."],
      ["Sweet Tea", "Unsweetened iced tea with a slice of lemon."],
      ["Milkshakes", "Homemade smoothie with banana, plant milk, and frozen berries."],
      ["Sugary Coffee Creamer", "Plant-based milk or homemade coconut creamer with maple syrup."],
    ],
    "Meals and Main Dishes": [
      ["White Bread", "Whole-grain, whole wheat, or rye bread."],
      ["Processed Pasta", "Zucchini noodles (zoodles), chickpea pasta, or whole-wheat pasta."],
      ["Cream-based Sauces", "Tomato-based sauces or blended vegetable sauces (e.g., butternut squash)."],
      ["Mayonnaise", "Hummus, mashed avocado, or plant-based yogurt."],
      ["White Rice", "Brown rice, quinoa, or cauliflower rice."],
      ["Fast-Food Burgers", "Homemade veggie or black bean burger on a whole-grain bun."],
      ["Takeaway Pizza", "Homemade pizza with whole-wheat or cauliflower crust, veggies, and vegan cheese."],
      ["Macaroni and Cheese", "Whole-wheat pasta with butternut squash or cashew-based sauce."],
      ["Takeaway Chinese food", "Homemade stir-fry with tofu/tempeh and vegetables."],
      ["Two-minute Noodles", "Rice or soba noodles in homemade vegetable broth."],
      ["Creamy Salad Dressing", "Olive oil and balsamic vinegar dressing."],
    ],
    "Condiments and Spreads": [
      ["Table Salt", "Herbs, spices, or lemon juice for flavor."],
      ["Ketchup", "Low-salt/sugar versions or homemade tomato sauce."],
      ["Butter", "Avocado or plant-based spread like hummus."],
      ["Sugar in Coffee", "Stevia, agave, or cinnamon sprinkle."],
      ["High-fat Sour Cream", "Low-fat plant yogurt or cashew cream."],
      ["Jam or Jelly", "Fresh fruit slices or mashed berry spread."],
    ],
  };

  return (
    <div className="page-root">
      <div className="layout-container">
        <header className="header">
          <div className="logo-container">
            <Link to="/user_dashboard">
              <img src={logo} alt="Fit-Fuel" style={{ height: "45px", objectFit: "contain" }} />
            </Link>
          </div>
          <div className="nav-actions">
            <nav className="nav-links-input">
              <Link to="/user_dashboard">Home</Link>
              <Link to="/aboutus">About Us</Link>
              <Link to="/contactus">Contact Us</Link>
              <ProfileButton
                userData={userData}
                onViewProfile={() => { }}
                onLogout={() => handleLogout(navigate)}
                onDeleteAccount={() => handleDeleteAccount(navigate)}
              />
            </nav>
          </div>
        </header>

        <PageContainer>
          <Title>Healthy Food Alternatives</Title>

          {Object.entries(categories).map(([category, items]) => (
            <div key={category}>
              <CategoryTitle>{category}</CategoryTitle>
              <Table>
                <thead>
                  <tr>
                    <Th>Instead of</Th>
                    <Th>Choose</Th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(([instead, choose], i) => (
                    <Row key={i}>
                      <Td>{instead}</Td>
                      <Td>{choose}</Td>
                    </Row>
                  ))}
                </tbody>
              </Table>
            </div>
          ))}
        </PageContainer>
      </div>

      <Footer />
    </div>
  );
}

const PageContainer = styled.div`
  background-color: var(--color-bg-primary);
  min-height: 60vh;
  padding: 40px 60px;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--color-primary);
  font-family: var(--font-display);
  margin-bottom: 40px;
`;

const CategoryTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-secondary-dark);
  margin-top: 40px;
  margin-bottom: 15px;
  border-left: 5px solid var(--color-primary);
  padding-left: 10px;
  font-family: var(--font-display);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 30px;
`;

const Th = styled.th`
  background-color: var(--color-primary);
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #ffffff;
`;

const Td = styled.td`
  padding: 12px;
  border-top: 1px solid var(--color-border);
  color: var(--color-text-primary);
  vertical-align: top;
`;

const Row = styled.tr`
  &:hover {
    background-color: var(--color-bg-secondary);
  }
`;
