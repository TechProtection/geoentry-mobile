import React from 'react';
import styled from 'styled-components/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';

const CardContainer = styled.View`
  background-color: ${COLORS.secondary}33;
  border-radius: 8px;
  padding: ${SPACING.lg}px;
  margin-vertical: ${SPACING.xs}px;
  height: 80px;
  justify-content: center;
`;

const Value = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.title}px;
  font-weight: bold;
  text-align: center;
`;

const Label = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
  text-align: center;
  margin-top: ${SPACING.xs}px;
`;

interface StatsCardProps {
    value: string;
    label: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ value, label }) => {
    return (
        <CardContainer>
            <Value>{value}</Value>
            <Label>{label}</Label>
        </CardContainer>
    );
};