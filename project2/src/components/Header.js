import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { media } from '../../config/breakpoints';

console.log(media);

const Header = ({ title }) => {
  const HeaderContainer = styled.div`
    background: var(--gradient-header);
    padding: 1.5em 1em;

    ${media.smMax} {
      background: orange;
    }
  `;
  const Title = styled.h1`
    color: var(--color-white);
    font-weight: 100;
    margin: 0 auto;
    max-width: 980px;
  `;
  return (
    <HeaderContainer>
      <Title>{title}</Title>
    </HeaderContainer>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
};

export default Header;
