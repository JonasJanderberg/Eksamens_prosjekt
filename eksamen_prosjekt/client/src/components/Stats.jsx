    import React from 'react';
    import { Container, Row, Col, Card, Table, Badge, Spinner } from 'react-bootstrap';
   
    const Stats = () => {
        return (
            
            <Container>
            <h2 className="mb-4">Dashboard Stats</h2>

            {/* Example stats cards */}
            <Row>
                <Col md={4}>
                    <Card className="text-center border-primary shadow-sm">
                        <Card.Body>
                            <Card.Title>Totalt</Card.Title>
                            <h1 className="display-4 text-primary">Dashboard</h1>
                            <Card.Text>Henvendeser</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
        )
}

    export default Stats;
