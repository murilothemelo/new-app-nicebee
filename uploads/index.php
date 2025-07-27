<?php
// Impedir acesso direto à pasta de uploads
header('HTTP/1.0 403 Forbidden');
exit('Acesso negado');
?>