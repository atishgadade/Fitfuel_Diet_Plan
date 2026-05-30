import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: linear-gradient(145deg, #1a3226, #14261d);
  border: 1px solid rgba(52, 101, 77, 0.5);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 25px;
  color: #e8f5ee;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #4ade80, #22c55e);
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
    border-color: #4ade80;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 15px;
`;

const MealTitle = styled.h3`
  color: #fff;
  font-size: 1.4rem;
  margin: 0;
  font-family: 'Lexend', sans-serif;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.5px;
`;

const Badge = styled.span`
  background-color: ${props => {
    switch (props.type) {
      case 'low': return 'rgba(40, 167, 69, 0.2)';
      case 'mid': return 'rgba(255, 193, 7, 0.2)';
      case 'high': return 'rgba(220, 53, 69, 0.2)';
      default: return 'rgba(108, 117, 125, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'low': return '#4ade80';
      case 'mid': return '#ffc107';
      case 'high': return '#ff6b6b';
      default: return '#adb5bd';
    }
  }};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 1px solid ${props => {
    switch (props.type) {
      case 'low': return '#4ade80';
      case 'mid': return '#ffc107';
      case 'high': return '#ff6b6b';
      default: return '#adb5bd';
    }
  }};
`;

const MainDish = styled.h4`
    color: #4ade80;
    margin-bottom: 1.5rem;
    font-family: 'Lexend', sans-serif;
    font-size: 1.1rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;

    &::before {
        content: '🍽️';
        font-size: 1.2rem;
    }
`;

const SectionTitle = styled.h5`
  color: #9ca3af;
  margin-top: 20px;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const List = styled.ul`
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
`;

const ListItem = styled.li`
  margin-bottom: 8px;
  color: #d1e7dd;
  line-height: 1.5;
  font-size: 0.95rem;
  display: flex;
  align-items: flex-start;
  gap: 10px;

  &::before {
    content: '•';
    color: #4ade80;
    font-weight: bold;
    font-size: 1.2rem;
    line-height: 1rem;
  }
`;

const DietCard = ({ title, data }) => {
  if (!data) return null;

  return (
    <Card>
      <Header>
        <MealTitle>{title}</MealTitle>
        <Badge type={data.budget}>{data.budget} Budget</Badge>
      </Header>

      <MainDish>{data.meal}</MainDish>

      {data.ingredients && data.ingredients.length > 0 && (
        <>
          <SectionTitle>Ingredients</SectionTitle>
          <List>
            {data.ingredients.map((item, index) => (
              <ListItem key={index}>{item}</ListItem>
            ))}
          </List>
        </>
      )}

      {data.recipe && data.recipe.length > 0 && (
        <>
          <SectionTitle>Instructions</SectionTitle>
          <List>
            {data.recipe.map((step, index) => (
              <ListItem key={index} style={{ gap: '12px' }}>
                <span style={{ color: '#4ade80', fontWeight: 'bold', minWidth: '15px' }}>{index + 1}.</span>
                {step}
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Card>
  );
};

export default DietCard;
