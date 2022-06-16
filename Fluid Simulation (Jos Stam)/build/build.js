var N = 55;
var gridSize = (N + 2) * (N + 2);
var lmbIsPressed = false;
var rmbIsPressed = false;
var showVelocity = true;
var showGrid = true;
var state = { u: [], v: [], u0: [], v0: [], dens: [], dens_prev: [] };
function swap_velocity(s) {
    var _a, _b;
    _a = [s.u0, s.u], s.u = _a[0], s.u0 = _a[1];
    _b = [s.v0, s.v], s.v = _b[0], s.v0 = _b[1];
}
function swap_density(s) {
    var _a;
    _a = [s.dens_prev, s.dens], s.dens = _a[0], s.dens_prev = _a[1];
}
function IX(i, j) {
    return i + (N + 2) * j;
}
function setup() {
    createCanvas(800, 800);
    initializeGrid(state);
}
function draw() {
    background(0);
    var dt = deltaTime / 1000;
    var viscosity = 0.99;
    var diffusion = 0.001;
    for (var i = 0; i < gridSize; ++i)
        state.v0[i] = 0;
    var center = Math.trunc(N / 2);
    for (var i = center - 2; i < center + 2; ++i) {
        for (var j = center + 5; j < center + 20; ++j) {
            state.v0[IX(i, j)] = -100;
        }
    }
    vel_step(N, state, viscosity, dt);
    dens_step(N, state, diffusion, dt);
    draw_dens(state);
}
function mousePressed(e) {
    if (e.button === 0)
        lmbIsPressed = true;
    if (e.button === 1)
        rmbIsPressed = true;
}
function keyPressed(e) {
    if (e.key === "s")
        showVelocity = !showVelocity;
    if (e.key === "g")
        showGrid = !showGrid;
    if (e.key === " ") {
        for (var i = 0; i < gridSize; ++i) {
            state.u0[i] = random() * 2 - 1;
            state.v0[i] = random() * 2 - 1;
        }
    }
}
function mouseReleased(e) {
    if (e.button === 0)
        lmbIsPressed = false;
    if (e.button === 1)
        rmbIsPressed = false;
}
function draw_dens(s) {
    var rectSize = width / (N + 2);
    for (var i = 1; i <= N; i++) {
        for (var j = 1; j <= N; j++) {
            var densValue = s.dens_prev[IX(i, j)];
            fill(densValue * 255);
            stroke(densValue * 255);
            var x = i * rectSize;
            var y = j * rectSize;
            if (showGrid)
                stroke("red");
            rect(x, y, rectSize, rectSize);
            var uVal = s.u0[IX(i, j)];
            var vVal = s.v0[IX(i, j)];
            var sqr = sqrt(Math.pow(uVal, 2) + Math.pow(vVal, 2));
            uVal /= sqr;
            vVal /= sqr;
            stroke("yellow");
            var centerX = x + rectSize / 2;
            var centerY = y + rectSize / 2;
            if (showVelocity)
                line(centerX, centerY, centerX + (uVal * rectSize) / 2, centerY + (vVal * rectSize) / 2);
        }
    }
}
function initializeGrid(s) {
    s.u = Array(gridSize).fill(0);
    s.v = Array(gridSize).fill(0);
    s.u0 = Array(gridSize).fill(0);
    s.v0 = Array(gridSize).fill(0);
    s.dens = Array(gridSize).fill(0);
    s.dens_prev = Array(gridSize).fill(0);
}
function add_source(N, x, s, dt) {
    for (var i = 0; i < gridSize; i++)
        x[i] += dt * s[i];
}
function add_density_from_mouse(N, s, dt) {
    if (lmbIsPressed) {
        var rectSize = width / (N + 2);
        var x = Math.trunc(mouseX / rectSize);
        var y = Math.trunc(mouseY / rectSize);
        s.dens[IX(x, y)] += dt * 100;
    }
}
function add_velocity_from_mouse(N, s, dt) {
    if (rmbIsPressed) {
        var rectSize = width / (N + 2);
        var x = Math.trunc(mouseX / rectSize);
        var y = Math.trunc(mouseY / rectSize);
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                s.u0[IX(x + i, y + j)] += dt * 10000;
                s.v0[IX(x + i, y + j)] += dt * 10000;
            }
        }
    }
}
function diffuse(N, b, x, x0, diff, dt) {
    var i, j, k;
    var a = dt * diff * N * N;
    for (k = 0; k < 20; k++) {
        for (i = 1; i <= N; i++) {
            for (j = 1; j <= N; j++) {
                x[IX(i, j)] =
                    (x0[IX(i, j)] +
                        a *
                            (x[IX(i - 1, j)] +
                                x[IX(i + 1, j)] +
                                x[IX(i, j - 1)] +
                                x[IX(i, j + 1)])) /
                        (1 + 4 * a);
            }
        }
        set_bnd(N, b, x);
    }
}
function advect(N, b, d, d0, u, v, dt) {
    var i, j, i0, j0, i1, j1;
    var x, y, s0, t0, s1, t1, dt0;
    dt0 = dt * N;
    for (i = 1; i <= N; i++) {
        for (j = 1; j <= N; j++) {
            x = i - dt0 * u[IX(i, j)];
            y = j - dt0 * v[IX(i, j)];
            if (x < 0.5)
                x = 0.5;
            if (x > N + 0.5)
                x = N + 0.5;
            i0 = Math.trunc(x);
            i1 = i0 + 1;
            if (y < 0.5)
                y = 0.5;
            if (y > N + 0.5)
                y = N + 0.5;
            j0 = Math.trunc(y);
            j1 = j0 + 1;
            s1 = x - i0;
            s0 = 1 - s1;
            t1 = y - j0;
            t0 = 1 - t1;
            d[IX(i, j)] =
                s0 * (t0 * d0[IX(i0, j0)] + t1 * d0[IX(i0, j1)]) +
                    s1 * (t0 * d0[IX(i1, j0)] + t1 * d0[IX(i1, j1)]);
        }
    }
    set_bnd(N, b, d);
}
function dens_step(N, s, diff, dt) {
    add_density_from_mouse(N, s, dt);
    swap_density(s);
    diffuse(N, 0, s.dens, s.dens_prev, diff, dt);
    swap_density(s);
    advect(N, 0, s.dens, s.dens_prev, s.u, s.v, dt);
}
function vel_step(N, s, visc, dt) {
    add_velocity_from_mouse(N, s, dt);
    swap_velocity(s);
    diffuse(N, 1, s.u, s.u0, visc, dt);
    diffuse(N, 2, s.v, s.v0, visc, dt);
    project(N, s.u, s.v, s.u0, s.v0);
    swap_velocity(s);
    advect(N, 1, s.u, s.u0, s.u0, s.v0, dt);
    advect(N, 2, s.v, s.v0, s.u0, s.v0, dt);
    project(N, s.u, s.v, s.u0, s.v0);
}
function project(N, u, v, p, div) {
    var i, j, k;
    var h;
    h = 1.0 / N;
    for (i = 1; i <= N; i++) {
        for (j = 1; j <= N; j++) {
            div[IX(i, j)] =
                -0.5 * h * (u[IX(i + 1, j)] - u[IX(i - 1, j)] + v[IX(i, j + 1)] - v[IX(i, j - 1)]);
            p[IX(i, j)] = 0;
        }
    }
    set_bnd(N, 0, div);
    set_bnd(N, 0, p);
    for (k = 0; k < 20; k++) {
        for (i = 1; i <= N; i++) {
            for (j = 1; j <= N; j++) {
                p[IX(i, j)] =
                    (div[IX(i, j)] +
                        p[IX(i - 1, j)] +
                        p[IX(i + 1, j)] +
                        p[IX(i, j - 1)] +
                        p[IX(i, j + 1)]) /
                        4;
            }
        }
        set_bnd(N, 0, p);
    }
    for (i = 1; i <= N; i++) {
        for (j = 1; j <= N; j++) {
            u[IX(i, j)] -= (0.5 * (p[IX(i + 1, j)] - p[IX(i - 1, j)])) / h;
            v[IX(i, j)] -= (0.5 * (p[IX(i, j + 1)] - p[IX(i, j - 1)])) / h;
        }
    }
    set_bnd(N, 1, u);
    set_bnd(N, 2, v);
}
function set_bnd(N, b, x) {
    var i;
    for (i = 1; i <= N; i++) {
        x[IX(0, i)] = b == 1 ? -x[IX(1, i)] : x[IX(1, i)];
        x[IX(N + 1, i)] = b == 1 ? -x[IX(N, i)] : x[IX(N, i)];
        x[IX(i, 0)] = b == 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
        x[IX(i, N + 1)] = b == 2 ? -x[IX(i, N)] : x[IX(i, N)];
    }
    x[IX(0, 0)] = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
    x[IX(0, N + 1)] = 0.5 * (x[IX(1, N + 1)] + x[IX(0, N)]);
    x[IX(N + 1, 0)] = 0.5 * (x[IX(N, 0)] + x[IX(N + 1, 1)]);
    x[IX(N + 1, N + 1)] = 0.5 * (x[IX(N, N + 1)] + x[IX(N + 1, N)]);
}
//# sourceMappingURL=build.js.map