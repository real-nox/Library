<?php
class DatabaseInit
{
    private $host = 'aws-1-eu-central-1.pooler.supabase.com';
    private $user = 'postgres.lqkmzmvfythflhejanum';
    private $password = 'EyaGRZdv6tSbfnxu';

    private $conn;

    function __construct()
    {
        try {
            $this->conn = new PDO(
                "pgsql:host=$this->host;port=5432;dbname=postgres",
                $this->user,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            echo $e->getMessage();
        }
    }

    function getData($query, $params) {
        try {
            $res = $this->conn->prepare($query);
            $res->execute($params);

            return $res->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            echo $e->getMessage();
        }
    }
}
?>   
