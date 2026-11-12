(function () {
  // 1. Hero Chocolate Drips & Sparkles Animation
  var hero = document.getElementById('top'),
      box = document.createElement('div'),
      i;
  box.className = 'drips';

  for (i = 0; i < 14; i++) {
    var d = document.createElement('div');
    d.className = 'drip';
    d.style.left = (i * 7.2 + 1) + '%';
    d.style.width = (3 + Math.random() * 3) + '%';
    d.style.animationDuration = (4 + Math.random() * 4) + 's';
    d.style.animationDelay = (-Math.random() * 6) + 's';
    box.appendChild(d);
  }
  hero.insertBefore(box, hero.firstChild);

  for (i = 0; i < 12; i++) {
    var s = document.createElement('span');
    s.className = 'sp';
    s.textContent = i % 3 ? '✦' : '♥';
    s.style.left = (Math.random() * 94) + '%';
    s.style.top = (18 + Math.random() * 60) + '%';
    s.style.fontSize = (0.8 + Math.random() * 1.1) + 'rem';
    s.style.animationDuration = (2.5 + Math.random() * 3) + 's';
    s.style.animationDelay = (-Math.random() * 4) + 's';
    hero.appendChild(s);
  }

  // 2. Store & Payment Configuration
  // ENTER YOUR GOOGLE PAY UPI ID BELOW (e.g., 'ruchikasawant@okicici')
  var PHONE = '919082140282',
      // Real UPI ID for payments
      UPI_ID = 'richasaw07-2@okhdfcbank',
      UPI_NAME = 'Lolas Tasty Bites',
      cart = [];

  function $(x) {
    return document.getElementById(x);
  }

  function num(t) {
    return parseInt(t.replace(/[^0-9]/g, ''), 10);
  }

  function toast(t) {
    var e = $('toast');
    e.textContent = t;
    e.classList.add('on');
    setTimeout(function () {
      e.classList.remove('on');
    }, 1400);
  }

  // Display & Copy UPI ID
  $('upi-disp').textContent = UPI_ID;
  $('cp-upi').addEventListener('click', function () {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(UPI_ID);
    }
    toast('UPI ID copied!');
  });

  // Toggle Google Pay / UPI Box vs Cash on Delivery
  document.querySelectorAll('input[name=pay]').forEach(function (r) {
    r.addEventListener('change', function () {
      $('upi-box').style.display = this.value.indexOf('Google Pay') === 0 ? 'block' : 'none';
    });
  });

  // 3. Cart Management
  function add(name, price) {
    var f = cart.filter(function (c) {
      return c.name === name;
    })[0];
    if (f) {
      f.q++;
    } else {
      cart.push({ name: name, price: price, q: 1 });
    }
    render();
    toast('Added: ' + name);
    var b = $('fab');
    b.classList.remove('hop');
    void b.offsetWidth;
    b.classList.add('hop');
  }

  function render() {
    var t = 0,
        n = 0,
        h = '';
    cart.forEach(function (c, i) {
      t += c.price * c.q;
      n += c.q;
      h += '<div class="ci"><span>' + c.name + '</span>' +
           '<button class="q" data-i="' + i + '" data-d="-1">−</button>' +
           '<b>' + c.q + '</b>' +
           '<button class="q" data-i="' + i + '" data-d="1">+</button>' +
           '<b style="min-width:64px;text-align:right">₹' + (c.price * c.q) + '</b></div>';
    });

    $('cl').innerHTML = h;
    $('cn').textContent = n;
    $('ct').textContent = '₹' + t;
    $('tt').textContent = '₹' + t;
    $('fab').classList.toggle('on', n > 0);
    $('ck').style.display = n ? 'block' : 'none';
    $('ef').style.display = n ? 'none' : 'block';

    // Update Google Pay / UPI QR Code & Deep Link
    if (UPI_ID && n) {
      var upiUrl = 'upi://pay?pa=' + UPI_ID +
                   '&pn=' + encodeURIComponent(UPI_NAME) +
                   '&am=' + t +
                   '&cu=INR' +
                   '&tn=' + encodeURIComponent('Lolas Tasty Bites Order');
      $('qr-amt').textContent = '₹' + t;
      $('upb').textContent = 'Pay ₹' + t + ' via UPI App';
      $('upb').href = upiUrl;
      $('uqr').src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(upiUrl);
    }

    if (!n) {
      $('ov').classList.remove('on');
    }
  }

  $('cl').addEventListener('click', function (e) {
    var b = e.target.closest('.q');
    if (!b) return;
    var c = cart[+b.getAttribute('data-i')];
    c.q += +b.getAttribute('data-d');
    if (c.q < 1) {
      cart.splice(+b.getAttribute('data-i'), 1);
    }
    render();
  });

  // 4. Populate Menu Add Buttons
  document.querySelectorAll('.panel').forEach(function (p) {
    var isW = p.id === 'p3',
        suf = p.id === 'p1' ? ' (per piece)' : '',
        pre = p.id === 'p2' ? 'Bar – ' : '';

    p.querySelectorAll('.row').forEach(function (r) {
      var s = r.children;
      if (r.classList.contains('h')) {
        r.appendChild(document.createElement('span'));
        return;
      }
      var name = s[0].textContent;
      if (isW) {
        [[1, ' (½ kg)'], [2, ' (1 kg)']].forEach(function (x) {
          var el = s[x[0]];
          el.classList.add('pbtn');
          el.title = 'Add to cart';
          el.addEventListener('click', function () {
            add(name + x[1], num(el.textContent));
          });
        });
        r.appendChild(document.createElement('span'));
      } else {
        var b = s[2],
            btn = document.createElement('button');
        btn.className = 'addb';
        btn.textContent = '+ Add';
        btn.addEventListener('click', function () {
          var w = s[1].textContent;
          add(pre + name + (w ? ' (' + w + ')' : '') + suf, num(b.textContent));
        });
        r.appendChild(btn);
      }
    });
  });

  // 5. Drawer & Checkout Events
  $('fab').addEventListener('click', function () { $('ov').classList.add('on'); });
  $('cx').addEventListener('click', function () { $('ov').classList.remove('on'); });
  $('ov').addEventListener('click', function (e) {
    if (e.target === $('ov')) $('ov').classList.remove('on');
  });

  $('fm').addEventListener('change', function () {
    $('fw').style.display = this.value === 'Delivery' ? 'block' : 'none';
  });

  $('sb').addEventListener('click', async function () {
    var n = $('fn').value.trim(),
        ph = $('fp').value.trim(),
        m = $('fm').value,
        ad = $('fa').value.trim(),
        nt = $('fo').value.trim(),
        utr = $('utr').value.trim(),
        er = $('er');
    var pay = document.querySelector('input[name=pay]:checked').value;

    if (!cart.length) return;
    if (!n || !ph) {
      er.textContent = 'Please enter your name and phone number.';
      return;
    }
    if (m === 'Delivery' && !ad) {
      er.textContent = 'Please enter your delivery address.';
      return;
    }
    if (pay.indexOf('Google Pay') === 0 && !utr) {
      er.textContent = 'Please complete the Google Pay / UPI payment and enter your 12-digit Transaction ID / UTR.';
      return;
    }

    er.textContent = '';
    var t = 0,
        l = cart.map(function (c) {
          t += c.price * c.q;
          return '• ' + c.name + ' × ' + c.q + ' = ₹' + (c.price * c.q);
        });

    var payload = {
      name: n,
      phone: ph,
      delivery_mode: m,
      address: m === 'Delivery' ? ad : '',
      note: nt,
      payment: pay,
      utr: utr,
      total: t,
      items: cart.map(function (c) {
        return { name: c.name, qty: c.q, price: c.price };
      })
    };

    try {
      var response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      var result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to save order.');
      }
      console.log('Order saved to backend:', result);
    } catch (err) {
      console.error('Backend save failed:', err);
      er.textContent = 'Order could not be saved online. Please try again or contact support.';
      return;
    }

    var msg = 'Hello Lolas_tasty_bites! I would like to place an order:\n\n' +
              l.join('\n') +
              '\n\nTotal: ₹' + t +
              '\nName: ' + n +
              '\nPhone: ' + ph +
              '\n' + m + (m === 'Delivery' ? ' address: ' + ad : '') +
              '\nPayment: ' + pay +
              (pay.indexOf('Google Pay') === 0 && utr ? '\nUPI Transaction ID: ' + utr : '') +
              (nt ? '\nNote: ' + nt : '');

    var url = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg);
    $('wl').href = url;
    $('wa2').href = 'whatsapp://send?phone=' + PHONE + '&text=' + encodeURIComponent(msg);
    $('mt').value = msg;
    $('wb').style.display = 'block';
    $('cp').click();
  });

  $('cp').addEventListener('click', function () {
    var t = $('mt');
    t.select();
    t.setSelectionRange(0, 99999);
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(t.value);
      } else {
        document.execCommand('copy');
      }
    } catch (e) {
      try { document.execCommand('copy'); } catch (x) {}
    }
    toast('Order copied!');
  });

  // 6. Menu Tabs & Scroll Reveal
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('on'); });
      document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('on'); });
      t.classList.add('on');
      document.getElementById(t.getAttribute('data-p')).classList.add('on');
    });
  });

  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('show');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach(function (el, k) {
      el.style.transitionDelay = ((k % 3) * 0.12) + 's';
      io.observe(el);
    });
  } else {
    els.forEach(function (el) { el.classList.add('show'); });
  }
})();