import React from 'react';

function Footer() {
  return (
    <footer className="p-4 text-center text-sm text-gray-400">
      <p>&copy; 2025 ARI TECHNOLOGY. All rights reserved.</p>
      <p className="mt-2">Location: Salim Street, Aqary tower</p>
      <p>Phone: <button onClick={() => {
          try {
            const u = JSON.parse(localStorage.getItem('currentUser'));
            if (!u) { alert('Please login to contact us by phone'); window.location.href = '/?login=1'; return; }
            window.location.href = 'tel:07707680040';
          } catch (e) { alert('Please login to contact us by phone'); window.location.href = '/?login=1'; }
        }} className="underline">07707680040</button></p>
      <p>Email: <button onClick={() => {
          try {
            const u = JSON.parse(localStorage.getItem('currentUser'));
            if (!u) { alert('Please login to contact us'); window.location.href = '/?login=1'; return; }
            window.location.href = 'mailto:aritechnology1@gmail.com';
          } catch (e) { alert('Please login to contact us'); window.location.href = '/?login=1'; }
        }} className="underline">aritechnology1@gmail.com</button></p>
    </footer>
  );
}

export default Footer;
