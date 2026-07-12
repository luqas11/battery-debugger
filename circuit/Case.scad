/* ============================================================
   BATTERY DEBUGGER - Case para NodeMCU V3
   ============================================================
   Apertura: tornillos autorroscantes (4 esquinas)
   Sujecion de la placa: tipo "sandwich" sobre postes que tambien
                          centran la placa en X/Y (encajan a
                          presion en los agujeros de montaje)
   LEDs: agujero a presion sin pegamento (escalon que traba el
         reborde/flange del LED)
   Puerto USB: hueco recesado (carcasa del conector macho + agujero
               del tamaño exacto del conector), con ranura de
               montaje oculta detras de una pared fina

   COMO IMPRIMIR:
   Cambia la variable render_part (arriba de todo, antes de los demas
   parametros) para elegir que renderizar/exportar: "base", "lid" o "both".
   Con "both" se dibujan las dos piezas lado a lado, utiles para ver el
   conjunto en preview, pero para exportar STL conviene exportar cada
   pieza por separado (con "base" o "lid").
   ============================================================ */

// ---------- QUE RENDERIZAR ----------
render_part = "both";  // "base" | "lid" | "both"

// ---------- PLACA (NodeMCU V3) ----------
board_length          = 58;     // mm, eje Y (largo)
board_width           = 31.3;   // mm, eje X (ancho)
board_height          = 20;     // mm, altura total con componentes + espacio para cablear LEDs adentro
mount_hole_dia        = 3.2;    // diametro de los agujeros de montaje de la placa
mount_hole_offset_x   = 2.85;   // centro del agujero al borde de la placa, sentido del lado corto (ancho)
mount_hole_offset_y   = 2.6;    // centro del agujero al borde de la placa, sentido del lado largo (largo)
peg_near_usb_extra    = 0.5;    // mm de mas para alejar de la pared los 2 postes del lado del conector
                                 // (sacrifica un poco de alineacion con el agujero real, a cambio de mas margen)

// ---------- TOLERANCIAS Y PAREDES ----------
wall                  = 2.0;    // espesor de pared
board_gap_usb_side    = 0.3;    // juego entre la placa y la cavidad, lado del conector USB -- debe quedar al ras
board_gap_far_side    = board_gap_usb_side;  // lado opuesto al USB -- igual al del USB, para que sea simetrico
board_gap_x_sides     = 5.0;    // margen entre la placa y la cavidad en los 2 lados X (izq/der) -- de sobra, sin ajuste fino
top_clearance         = 1.0;    // espacio libre entre el componente mas alto y la tapa
margin                = 6.0;    // franja libre entre la cavidad y la pared externa (para los postes de tornillo)

// ---------- POSTES DE CENTRADO / STANDOFF (sandwich) ----------
peg_height            = 5.0;    // altura del cilindro ancho (separacion piso<->placa)
peg_base_dia          = 5.0;    // diametro del cilindro ancho (mas resistente, evita que
                                 // los componentes de la placa hagan presion contra el piso)
peg_tip_height        = 3.0;    // altura de la punta fina que entra en el agujero de la placa
peg_tip_dia           = mount_hole_dia - 0.2;  // un poco menor a mount_hole_dia -> encaja a presion
board_thickness       = 1.0;    // espesor real de la PCB (sin componentes, que miran hacia el piso)

// ---------- POSTE DE PRESION (colgante desde la tapa, unico y central) ----------
// Empuja la placa contra los postes de centrado al cerrar, sin ocupar
// espacio en las esquinas ni en la mayor parte del volumen de cableado.
press_post_w          = 10.0;   // ancho del poste de presion (eje X)
press_post_l          = 20.0;   // largo del poste de presion (eje Y)
press_post_corner_r   = 2.0;    // radio de redondeo de los 4 bordes verticales del poste
press_post_overlap    = -0.5;   // mm de mas (o de menos, si es negativo) que el poste se pasa hacia
                                 // la placa -- negativo = queda corto a proposito, para no presionar de mas

// ---------- TORNILLOS AUTORROSCANTES (tapa) ----------
screw_pilot_dia       = 3.0;    // agujero piloto para que el tornillo se muerda
screw_pilot_depth     = 8.0;    // profundidad del agujero piloto dentro del poste
screw_shaft_clear_dia = 3.0;    // hueco en la tapa para que pase el cuerpo del tornillo
screw_head_clear_dia  = 6.4;    // hueco para la cabeza del tornillo (avellanado) -- cabeza real 6mm + 0.4mm de juego
screw_head_depth      = 3.0;    // profundidad del avellanado -- altura real de la cabeza conica del tornillo

// ---------- REGISTRO DE LA TAPA (centrado) ----------
rabbet_height       = 0.8;  // alto del escalon de registro, en todo el borde superior
rabbet_width        = 2.0;  // ancho de ese escalon (banda a lo largo del borde)
rabbet_clearance    = 0.2;  // juego entre el escalon de la base y el hueco de la tapa

// ---------- USB (pared frontal, y=0) ----------
usb_cutout_w                    = 8;    // ancho de la abertura -- igual al ancho real del conector
usb_cutout_h                    = 3;    // alto de la abertura -- igual al alto real del conector
usb_x_offset                    = 0;    // +/- mm si el puerto no esta centrado -- VERIFICAR
usb_z_adjust                    = -0.5; // mm, cuanto mas abajo del nivel de la placa (floor_thickness+peg_height)
                                         // queda la cara superior del hueco -- negativo = queda mas arriba.
                                         // Ajustado tras la 2da impresion y prueba.
usb_connector_overhang          = 1.5;  // mm, cuanto sobresale el conector del borde de la placa
usb_cover_thickness             = 1.0;  // espesor de la pared que tapa la ranura, ubicada al ras de la punta del conector
usb_plug_housing_w              = 15;   // ancho del hueco para la carcasa plastica del conector macho (desde afuera)
usb_plug_housing_h              = 10;   // alto del hueco para la carcasa plastica del conector macho (desde afuera)
usb_plug_roof_angle             = 60;   // grados desde la vertical del chaflan que reemplaza el techo plano
                                         // (mas chico = pared mas parada = mejor para imprimir sin soporte)
usb_relief_w                    = 10;   // ancho de la ranura interna de alivio (lado de la cavidad)

// ---------- LEDs (en la tapa) ----------
led_dia          = 5.0;   // diametro del LED (dado: 5mm)
led_through_dia  = led_dia + 0.1;  // agujero exterior, el cuerpo del LED pasa a ras
led_flange_dia   = 5.8;   // diametro del reborde/flange del LED -- VERIFICAR (varia segun el fabricante)
led_flange_depth = 1.0;   // profundidad del escalon donde se traba el reborde

// ---------- CONECTOR EMBUTIDO (pared frontal, arriba del USB) ----------
// Conector tipo JST embutido en la pared, con el socket mirando hacia
// afuera (para enchufar un cable desde afuera) y los pines mirando hacia
// adentro (para cablear directo a la placa). Retencion en las 2
// direcciones: una pared fina con ventana chica (el cuerpo no puede salir
// por ahi) + un tope colgando de la tapa (no puede hundirse hacia adentro).
conn_w                = 7.5;    // ancho del cuerpo del conector (medida real)
conn_h                = 5.7;    // alto del cuerpo del conector (medida real)
conn_h_clearance      = 0.5;    // margen extra en el alto del bolsillo, para que no quede tan justo -> 6.2mm en total
conn_d                = 7.1;    // profundidad del cuerpo del conector (medida real)
conn_d_clearance      = 0.5;    // margen extra en la profundidad -- en la practica no agranda el
                                 // bolsillo (esa zona ya es hueca por la cavidad), solo corre el
                                 // tope 0.5mm mas adentro
conn_cover_thickness  = 1.5;    // espesor de la pared fina, pegada a la cara exterior
conn_hole_clearance   = 0.5;    // mm de solape por lado entre el cuerpo y la ventana (retencion)
conn_stop_w           = 10.0;   // ancho del tope (cuelga de la tapa)
conn_stop_h           = 2.5;    // alto del tope
conn_stop_thickness   = 1.5;    // espesor del tope (eje Y)

// ---------- GENERAL ----------
floor_thickness  = 2.0;   // espesor del piso de la base
lid_thickness    = 4.0;   // espesor de la tapa -- suficiente para 3mm de avellanado + 1mm de material debajo
$fn = 32;                 // resolucion de los cilindros

// ============================================================
// CALCULOS DERIVADOS (no tocar salvo que sepas lo que haces)
// ============================================================
cavity_w   = board_width + 2*board_gap_x_sides;                        // ambos lados en X usan el gap de los lados X
cavity_l   = board_length + board_gap_usb_side + board_gap_far_side;   // Y: lado USB (cerca) y lado opuesto (lejos), ahora simetricos
ext_w      = cavity_w + 2*margin + 2*wall;
ext_l      = cavity_l + 2*margin + 2*wall;
wall_height = peg_height + board_height + top_clearance;
case_top    = floor_thickness + wall_height;       // altura de las paredes/postes, sin el escalon de registro

board_x0 = wall + margin + board_gap_x_sides;      // ambos lados en X usan el gap de los lados X
board_y0 = wall + margin + board_gap_usb_side;      // lado USB (cerca): gap chico, la placa queda al ras

peg_positions = [
    [board_x0 + mount_hole_offset_x,               board_y0 + mount_hole_offset_y + peg_near_usb_extra],
    [board_x0 + board_width - mount_hole_offset_x, board_y0 + mount_hole_offset_y + peg_near_usb_extra],
    [board_x0 + mount_hole_offset_x,               board_y0 + board_length - mount_hole_offset_y],
    [board_x0 + board_width - mount_hole_offset_x, board_y0 + board_length - mount_hole_offset_y],
];

// posicion de los agujeros de tornillo (piloto en la base, paso+cabeza en
// la tapa) -- el material alrededor ya es solido, viene del bloque macizo
// de la base (wall+margin), sin necesidad de un poste separado
boss_inset = wall + margin/2;
boss_positions = [
    [boss_inset,           boss_inset],
    [ext_w - boss_inset,   boss_inset],
    [boss_inset,           ext_l - boss_inset],
    [ext_w - boss_inset,   ext_l - boss_inset],
];

usb_x = ext_w/2 + usb_x_offset;
// usb_z se define para que la cara SUPERIOR del hueco del conector quede
// usb_z_adjust por debajo de la altura donde los postes pasan de
// cilindro grueso a fino (floor_thickness+peg_height) -- esa transicion
// es donde apoya la placa. Con usb_z_adjust negativo, el hueco queda mas
// arriba de esa transicion (ajustado empiricamente tras la 2da impresion).
usb_z = floor_thickness + peg_height - usb_z_adjust - usb_cutout_h/2;

led_spacing = 15;  // separacion entre los 2 LEDs (eje X)
led_positions = [
    [ext_w/2 - led_spacing/2, ext_l*0.75],
    [ext_w/2 + led_spacing/2, ext_l*0.75],
];

// poste de presion: centrado sobre la placa (no sobre el case), para
// caer en la zona con mas margen de componentes/cableado alrededor
press_post_x = board_x0 + board_width/2;
press_post_y = board_y0 + board_length/2;
// altura del poste: cuelga desde la cara interna de la tapa (case_top)
// hasta la superficie de arriba de la PCB, pasandose press_post_overlap
// para asegurar contacto real (un poco de presion, no solo un roce)
board_top_z    = floor_thickness + peg_height + board_thickness;
press_post_len = case_top - board_top_z + press_post_overlap;

// conector embutido: centrado en X, lo mas arriba posible en Z (el borde
// superior de la muesca coincide con case_top, asi no necesita techo -- la
// tapa lo tapa naturalmente al cerrar)
conn_x  = ext_w/2;
conn_z0 = case_top - (conn_h + conn_h_clearance);  // Z donde arranca (abajo) la muesca del conector
// posiciones Y clave, todas medidas desde la cara exterior del case (Y=0):
conn_y1 = conn_cover_thickness;    // fin de la pared fina / inicio del bolsillo
conn_y2 = conn_y1 + conn_d + conn_d_clearance;  // fin del cuerpo del conector / inicio del tope

// ============================================================
// MODULOS
// ============================================================

// marco rectangular (como un cuadro): util tanto para agregar el escalon
// de registro en la base (solido) como para cortar su hueco en la tapa
module rect_frame(outer_w, outer_l, inner_w, inner_l, h) {
    difference() {
        cube([outer_w, outer_l, h]);
        translate([(outer_w-inner_w)/2, (outer_l-inner_l)/2, -1])
            cube([inner_w, inner_l, h+2]);
    }
}

// prisma rectangular con los 4 bordes verticales redondeados (radio r),
// armado con un hull() de 4 cilindros en las esquinas
module rounded_rect_prism(w, l, h, r) {
    hull() {
        for (dx = [r, w-r])
            for (dy = [r, l-r])
                translate([dx, dy, 0])
                    cylinder(r=r, h=h);
    }
}

module usb_cutout() {
    usb_depth = wall + margin; // espesor solido real hasta llegar a la cavidad
    eps = 0.05; // pequeno solapamiento para evitar caras coincidentes (z-fighting)

    // posicion de la pared que tapa la ranura: al ras de la punta del
    // conector (que sobresale usb_connector_overhang del borde REAL de
    // la placa, board_y0 -- no del limite de la cavidad, que queda
    // board_gap_usb_side mas afuera)
    cover_inner_y = board_y0 - usb_connector_overhang;    // cara que toca la punta del conector
    cover_outer_y = cover_inner_y - usb_cover_thickness;  // cara exterior de esa pared

    z0 = usb_z - usb_cutout_h/2; // Z donde arranca el hueco del conector

    // hueco recto para enchufar el cable: tamaño exacto del conector,
    // atraviesa solo el espesor de la pared fina que lo toca
    translate([usb_x-usb_cutout_w/2, cover_outer_y-eps, z0])
        cube([usb_cutout_w, cover_inner_y-cover_outer_y+2*eps, usb_cutout_h]);

    // hueco para que entre la carcasa plastica del conector macho que se
    // va a enchufar: desde la superficie exterior del case hasta la pared
    // fina, centrado en el hueco del conector
    translate([usb_x-usb_plug_housing_w/2, -1, usb_z-usb_plug_housing_h/2])
        cube([usb_plug_housing_w, cover_outer_y+eps+1, usb_plug_housing_h]);

    // chaflan en el techo de ese hueco: reemplaza la superficie horizontal
    // (que sale mal al imprimir, es un puente sin soporte de 15mm) por una
    // punta con paredes inclinadas a usb_plug_roof_angle grados desde la
    // vertical. El rectangulo de arriba no se toca -- esto se suma encima,
    // arrancando justo en su borde superior.
    roof_base_z = usb_z + usb_plug_housing_h/2;               // techo del rectangulo existente
    roof_peak_h = (usb_plug_housing_w/2) / tan(usb_plug_roof_angle); // altura del chaflan
    hull() {
        // linea de la base del chaflan: ancho completo, al ras del techo
        translate([usb_x-usb_plug_housing_w/2, -1, roof_base_z-eps])
            cube([usb_plug_housing_w, cover_outer_y+eps+1, eps]);
        // linea de la cresta: angosta, en la punta del chaflan
        translate([usb_x-eps/2, -1, roof_base_z+roof_peak_h-eps])
            cube([eps, cover_outer_y+eps+1, eps]);
    }

    // ranura de alivio para el montaje (lado de la cavidad): le da lugar
    // al conector -que sobresale del borde de la placa- para bajar sin
    // trabarse al montar la placa desde arriba. Ahora llega hasta el piso
    // de la base (no solo hasta la altura del conector) para tener mas
    // margen de sobra.
    translate([usb_x-usb_relief_w/2, cover_inner_y-eps, floor_thickness])
        cube([usb_relief_w, usb_depth-cover_inner_y+1+eps, case_top+5-floor_thickness]);
}

// muesca del conector embutido: pared fina con ventana chica (retencion
// hacia afuera) + bolsillo sin techo para el cuerpo del conector
module conn_cutout() {
    eps = 0.05; // solapamiento para evitar caras coincidentes (z-fighting)

    // ventana en la pared fina: mas chica que el cuerpo en X y en el
    // borde inferior en Z (0.5mm de solape, retencion), pero se abre
    // hacia arriba sin techo -- igual que el bolsillo -- para no dejar
    // un puente de material sin soporte sobre el hueco al imprimir
    hole_w      = conn_w - 2*conn_hole_clearance;
    hole_bottom = conn_z0 + conn_hole_clearance;
    translate([conn_x-hole_w/2, -1, hole_bottom])
        cube([hole_w, conn_y1+eps+1, case_top-hole_bottom+1]);

    // bolsillo para el cuerpo del conector: sin techo (llega hasta
    // case_top, el borde superior de la pared) -- se llena por arriba
    // antes de cerrar la tapa, y la tapa hace de techo al cerrar
    translate([conn_x-conn_w/2, conn_y1-eps, conn_z0])
        cube([conn_w, conn_y2-conn_y1+2*eps, case_top-conn_z0+1]);
}

module base() {
    difference() {
        union() {
            difference() {
                cube([ext_w, ext_l, case_top]);
                // cavidad interna donde va la placa
                translate([wall+margin, wall+margin, floor_thickness])
                    cube([cavity_w, cavity_l, wall_height + 2]);
                // abertura USB
                usb_cutout();
                // muesca del conector embutido
                conn_cutout();
            }
            // escalon de registro: corre por todo el borde superior y
            // hace que la tapa solo entre bien centrada en X/Y. Se le
            // resta conn_cutout() tambien a este bloque -- si no, queda
            // como una capa aparte que no se entera del corte de abajo,
            // y se forma un puente de material sobre la muesca del conector.
            difference() {
                translate([0, 0, case_top])
                    rect_frame(ext_w, ext_l, ext_w-2*rabbet_width, ext_l-2*rabbet_width, rabbet_height);
                conn_cutout();
            }
        }
        // agujeros piloto para que el tornillo se muerda (desde arriba hacia
        // abajo). El material alrededor ya es solido -- viene del bloque
        // macizo de la base (wall+margin), no de un poste separado.
        for (p = boss_positions)
            translate([p[0], p[1], case_top-screw_pilot_depth])
                cylinder(d=screw_pilot_dia, h=screw_pilot_depth+1);
    }

    // postes de centrado de la placa: base ancha (separacion + resistencia)
    // + punta fina que encaja a presion en los agujeros de montaje
    for (p = peg_positions) {
        translate([p[0], p[1], floor_thickness])
            cylinder(d=peg_base_dia, h=peg_height);
        translate([p[0], p[1], floor_thickness + peg_height])
            cylinder(d=peg_tip_dia, h=peg_tip_height);
    }
}

module lid() {
    difference() {
        union() {
            cube([ext_w, ext_l, lid_thickness]);
            // poste de presion: cuelga desde la cara interna de la tapa
            // (z=0 de este bloque) hacia abajo, entrando en la cavidad
            translate([press_post_x-press_post_w/2, press_post_y-press_post_l/2, -press_post_len])
                rounded_rect_prism(press_post_w, press_post_l, press_post_len, press_post_corner_r);

            // tope del conector embutido: cuelga desde la cara interna de
            // la tapa, justo detras del cuerpo del conector (en Y), para
            // frenarlo si lo empujan hacia adentro al enchufar un cable
            translate([conn_x-conn_stop_w/2, conn_y2, -conn_stop_h])
                cube([conn_stop_w, conn_stop_thickness, conn_stop_h]);
        }

        // hueco de registro: calza con el escalon de la base (con un poco
        // de juego en el lado interior) para que la tapa se centre sola
        rect_frame(ext_w, ext_l,
                    ext_w-2*(rabbet_width+rabbet_clearance),
                    ext_l-2*(rabbet_width+rabbet_clearance),
                    rabbet_height);

        // agujeros para los tornillos (paso libre + avellanado conico para
        // la cabeza, que es conica y no plana -- angosto abajo, empalmando
        // con el hueco de paso del cuerpo, ancho arriba, del diametro de
        // la cabeza, justo en la superficie de la tapa)
        for (p = boss_positions) {
            translate([p[0], p[1], lid_thickness-screw_head_depth])
                cylinder(h=screw_head_depth, d1=screw_shaft_clear_dia, d2=screw_head_clear_dia);
            translate([p[0], p[1], -1])
                cylinder(d=screw_shaft_clear_dia, h=lid_thickness+2);
        }

        // agujeros de LED: escalon ancho por abajo (traba el flange) + agujero angosto a ras arriba
        for (p = led_positions) {
            translate([p[0], p[1], -1])
                cylinder(d=led_flange_dia, h=led_flange_depth+1);
            translate([p[0], p[1], led_flange_depth-1])
                cylinder(d=led_through_dia, h=lid_thickness-led_flange_depth+2);
        }
    }
}

// ============================================================
// RENDER (controlado por render_part, definida al principio del archivo)
// ============================================================
if (render_part == "base") {
    base();
} else if (render_part == "lid") {
    // rotada 180 grados sobre el eje Y (solo render/export, el modulo
    // lid() no se toca): esto invierte X y Z pero deja Y intacto -- como
    // el diseño es simetrico en X, queda exactamente en la misma posicion
    // que antes, solo que con la cara plana apoyada contra la bandeja de
    // impresion y el poste/tope apuntando hacia arriba, sin soporte
    translate([ext_w, 0, lid_thickness]) rotate([0, 180, 0]) lid();
} else {
    // "both": lado a lado, solo para preview -- exportar STL por separado
    translate([0, 0, 0])           base();
    // misma rotacion sobre Y que en la rama "lid" (ver comentario ahi)
    translate([ext_w + 20, 0, 0])
        translate([ext_w, 0, lid_thickness]) rotate([0, 180, 0]) lid();
}
