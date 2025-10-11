import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

/**
 * FooterComponent - Main application footer
 *
 * Features:
 * - Primary navigation links
 * - Social media links
 * - Copyright information
 * - Responsive design
 * - Theme-aware styling
 */
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink]
})
export class FooterComponent {

  // Current year for copyright
  currentYear = new Date().getFullYear();

  // Social media links
  socialLinks = [
    {
      name: 'Facebook',
      icon: 'facebook',
      url: 'https://facebook.com/bikerental',
      color: '#1877F2'
    },
    {
      name: 'Instagram',
      icon: 'instagram',
      url: 'https://instagram.com/bikerental',
      color: '#E4405F'
    },
    {
      name: 'X (Twitter)',
      icon: 'twitter',
      url: 'https://x.com/bikerental',
      color: '#000000'
    },
    {
      name: 'GitHub',
      icon: 'github',
      url: 'https://github.com/renetguerra/BikeRental',
      color: '#333333'
    }
  ];

  // Navigation links
  navigationLinks = [
    { label: 'Home', route: '/' },
    { label: 'Bikes', route: '/bikes' },
    { label: 'About', route: '/about' },
    { label: 'Contact', route: '/contact' }
  ];

  /**
   * Open social media link in new tab
   */
  openSocialLink(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
